// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { LockedByPartitionDLTEvent } from "@port/bond/usecase/createbondlock/model/LockedByPartitionDLTEvent"
import { BondLockPersistence } from "@port/bond/persistence/model/BondLockPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondLockFoundError } from "@domain/bond/lock/errors/BondLockFoundError"
import { BondHolderBalancePersistence } from "@port/bond/persistence/model/BondHolderBalancePersistence"

describe("CreateBondLockNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let bondLockRepository: Repository<BondLockPersistence>
  let bondRepository: Repository<BondPersistence>
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>

  const createTestBond = async (contractId: string = "0.0.6974684"): Promise<BondPersistence> => {
    const bond = {
      contractId,
      treasuryId: "0.0.6974684",
      kpiId: "0.0.6974684",
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

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
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

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondLockRepository.clear()
    await bondHolderBalanceRepository.clear()
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("CreateBondLockNestJSEventAdapter", () => {
    it("should create a new bond lock when LockedByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new LockedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        "1735689600",
      )

      await eventBus.publishSync(event, LockedByPartitionDLTEvent.name)

      const savedBondLock = await bondLockRepository.findOne({
        where: { id: 1, contractId: "0.0.6974684" },
      })

      expect(savedBondLock).toBeDefined()
      expect(savedBondLock).not.toBeNull()
      expect(savedBondLock!.id).toBe(1)
      expect(savedBondLock!.contractId).toBe("0.0.6974684")
      expect(savedBondLock!.holderAccountId).toBe("0.0.7654321")
      expect(savedBondLock!.partition).toBe("0x7265736572766564000000000000000000000000000000000000000000000000")
      expect(savedBondLock!.amount).toBe("1000")
      expect(savedBondLock!.expirationTimestamp).toEqual(new Date(1735689600 * 1000))
      expect(savedBondLock!.operatorAccountId).toBe("0.0.1234567")
    })

    it("should throw BondLockFoundError when bond lock with same lockId and contractId already exists", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const existingBondLock = {
        id: 1,
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "500",
        expirationTimestamp: new Date("2024-12-01"),
        operatorAccountId: "0.0.1234567",
      }

      await bondLockRepository.save(existingBondLock)

      const event = new LockedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        "1735689600",
      )

      await expect(eventBus.publishSync(event, LockedByPartitionDLTEvent.name)).rejects.toThrow(
        BondLockFoundError.lockIdError(existingBondLock.contractId, existingBondLock.id),
      )
    })

    it("should create multiple bond locks with different lockIds successfully", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "100000",
        lockedBalance: "0",
      })

      const lockIds = [1, 2, 3]

      for (const lockId of lockIds) {
        const event = new LockedByPartitionDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${lockId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          lockId,
          `${1000 * lockId}`,
          "1735689600",
        )

        await eventBus.publishSync(event, LockedByPartitionDLTEvent.name)

        const savedBondLock = await bondLockRepository.findOne({
          where: { id: lockId, contractId: "0.0.6974684" },
        })

        expect(savedBondLock).toBeDefined()
        expect(savedBondLock).not.toBeNull()
        expect(savedBondLock!.id).toBe(lockId)
        expect(savedBondLock!.amount).toBe(`${1000 * lockId}`)
      }

      const allBondLocks = await bondLockRepository.find()
      expect(allBondLocks).toHaveLength(lockIds.length)
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new LockedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        "1735689600",
      )

      await eventBus.publishSync(event, LockedByPartitionDLTEvent.name)

      const savedBondLock = await bondLockRepository.findOne({
        where: { id: 1, contractId: "0.0.6974684" },
      })

      expect(savedBondLock).toBeDefined()
      expect(savedBondLock!.contractId).toMatch(/^0\.0\.\d+$/)
      expect(savedBondLock!.holderAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedBondLock!.operatorAccountId).toMatch(/^0\.0\.\d+$/)
    })

    it("should publish CreatedBondLockEvent after successful bond lock creation", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new LockedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        "1735689600",
      )

      await eventBus.publishSync(event, LockedByPartitionDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          id: 1,
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          expirationTimestamp: new Date(1735689600 * 1000),
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
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition,
          availableBalance: "10000",
          lockedBalance: "0",
        })
      }

      for (let i = 0; i < partitions.length; i++) {
        const event = new LockedByPartitionDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          partitions[i],
          i + 1,
          "1000",
          "1735689600",
        )

        await eventBus.publishSync(event, LockedByPartitionDLTEvent.name)

        const savedBondLock = await bondLockRepository.findOne({
          where: { id: i + 1, contractId: "0.0.6974684" },
        })

        expect(savedBondLock).toBeDefined()
        expect(savedBondLock!.partition).toBe(partitions[i])
      }

      const allBondLocks = await bondLockRepository.find()
      expect(allBondLocks).toHaveLength(partitions.length)
    })
  })
})
