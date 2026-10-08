// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { LockByPartitionReleasedDLTEvent } from "@port/lock/usecase/releasebondlock/model/LockByPartitionReleasedDLTEvent"
import { BondLockPersistence } from "@port/lock/persistence/model/BondLockPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondLockNotFoundError } from "@domain/lock/errors/BondLockNotFoundError"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"

describe("ReleaseBondLockNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondLockRepository: Repository<BondLockPersistence>
  let bondRepository: Repository<BondPersistence>
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>

  const createTestBond = async (contractId: string = "0.0.6974684"): Promise<BondPersistence> => {
    const bond = {
      contractId,
      treasuryId: "0.0.6974684",
      name: "Test Bond",
      symbol: "TB",
      isin: "US1234567890",
      decimals: 2,
      currency: "USD",
      nominalValue: "100",
      nominalValueDecimals: 2,
      startingDate: new Date("2023-01-01"),
      maturityDate: new Date("2028-01-01"),
      maxSupply: "1000000",
    }
    return await bondRepository.save(bond)
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    bondLockRepository = app.get(getRepositoryToken(BondLockPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))

    // Mock the ConverterUtils to return consistent Hedera addresses
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.1234567",
        "0xb3533f32594B689F19A94C608490451478F7197b": "0.0.7654321",
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondLockRepository.query('DELETE FROM "Bonds"')
    await bondHolderBalanceRepository.query('DELETE FROM "Bonds"')
    await bondRepository.query('DELETE FROM "Bonds"')
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ReleaseBondLockNestJSEventAdapter", () => {
    it("should release a bond lock when LockByPartitionReleasedDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "1000",
      })

      const existingBondLock = {
        id: 1,
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        operatorAccountId: "0.0.1234567",
      }

      await bondLockRepository.save(existingBondLock)

      const event = new LockByPartitionReleasedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
      )

      await eventBus.publishSync(event, LockByPartitionReleasedDLTEvent.name)

      const deletedBondLock = await bondLockRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(deletedBondLock).toBeNull()

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(updatedBalance).toBeDefined()
      expect(updatedBalance!.availableBalance).toBe("10000")
      expect(updatedBalance!.lockedBalance).toBe("0")
    })

    it("should throw BondLockNotFoundError when bond lock does not exist", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new LockByPartitionReleasedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "99",
      )

      await expect(eventBus.publishSync(event, LockByPartitionReleasedDLTEvent.name)).rejects.toThrow(
        BondLockNotFoundError.lockIdError("0.0.6974684", 99),
      )
    })

    it("should release multiple bond locks successfully", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "4000",
        lockedBalance: "6000",
      })

      const lockIds = [1, 2, 3]

      for (const lockId of lockIds) {
        await bondLockRepository.save({
          id: lockId,
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "2000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          operatorAccountId: "0.0.1234567",
        })
      }

      for (const lockId of lockIds) {
        const event = new LockByPartitionReleasedDLTEvent(
          "0.0.6974684",
          `0x123456789${lockId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          String(lockId),
        )

        await eventBus.publishSync(event, LockByPartitionReleasedDLTEvent.name)

        const deletedBondLock = await bondLockRepository.findOne({
          where: { id: lockId, bondContractId: "0.0.6974684" },
        })

        expect(deletedBondLock).toBeNull()
      }

      const allBondLocks = await bondLockRepository.find()
      expect(allBondLocks).toHaveLength(0)

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(updatedBalance!.availableBalance).toBe("10000")
      expect(updatedBalance!.lockedBalance).toBe("0")
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "1000",
      })

      await bondLockRepository.save({
        id: 1,
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        operatorAccountId: "0.0.1234567",
      })

      const converterSpy = jest.mocked(ConverterUtils.getHederaAddressFromEvm)

      const event = new LockByPartitionReleasedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
      )

      await eventBus.publishSync(event, LockByPartitionReleasedDLTEvent.name)

      expect(converterSpy).toHaveBeenCalledWith("0xb3533f32594B689F19A94C608490451478F7197b")
      expect(converterSpy).toHaveBeenCalledWith("0x48ca774f6942166bf37e178ccc1e861947ead8c7")
    })

    it("should publish ReleasedBondLockEvent after successful bond lock release", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "1000",
      })

      await bondLockRepository.save({
        id: 1,
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        operatorAccountId: "0.0.1234567",
      })

      const event = new LockByPartitionReleasedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
      )

      await eventBus.publishSync(event, LockByPartitionReleasedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          id: 1,
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          operatorAccountId: "0.0.1234567",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should handle different partitions for the same bond", async () => {
      await createTestBond("0.0.6974684")

      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
      ]

      for (const partition of partitions) {
        await bondHolderBalanceRepository.save({
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition,
          availableBalance: "9000",
          lockedBalance: "1000",
        })
      }

      for (let i = 0; i < partitions.length; i++) {
        await bondLockRepository.save({
          id: i + 1,
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: partitions[i],
          amount: "1000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          operatorAccountId: "0.0.1234567",
        })

        const event = new LockByPartitionReleasedDLTEvent(
          "0.0.6974684",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          partitions[i],
          String(i + 1),
        )

        await eventBus.publishSync(event, LockByPartitionReleasedDLTEvent.name)

        const deletedBondLock = await bondLockRepository.findOne({
          where: { id: i + 1, bondContractId: "0.0.6974684" },
        })

        expect(deletedBondLock).toBeNull()
      }

      const allBondLocks = await bondLockRepository.find()
      expect(allBondLocks).toHaveLength(0)
    })
  })
})
