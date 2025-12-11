// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { HeldByPartitionDLTEvent } from "@port/hold/usecase/createbondhold/model/HeldByPartitionDLTEvent"
import { BondHoldPersistence } from "@port/hold/persistence/model/BondHoldPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondHoldFoundError } from "@domain/hold/errors/BondHoldFoundError"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"

describe("CreateBondHoldNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondHoldRepository: Repository<BondHoldPersistence>
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

  const createTestBondHolderBalance = async (
    contractId: string,
    holderAccountId: string,
    partition: string,
    availableBalance: string,
  ): Promise<BondHolderBalancePersistence> => {
    const balance = {
      contractId,
      holderAccountId,
      partition,
      availableBalance,
      lockedBalance: "0",
      heldBalance: "0",
    }
    return await bondHolderBalanceRepository.save(balance)
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
    bondHoldRepository = app.get(getRepositoryToken(BondHoldPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))

    // Mock the ConverterUtils to return consistent Hedera addresses
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.1234567",
        "0xb3533f32594B689F19A94C608490451478F7197b": "0.0.7654321",
        "0xa1b2c3d4e5f6789012345678901234567890abcd": "0.0.9999999",
        "0x0000000000000000000000000000000000000000": "0.0.0",
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondHoldRepository.clear()
    await bondHolderBalanceRepository.clear()
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("CreateBondHoldNestJSEventAdapter", () => {
    it("should create a new bond hold and decrease holder balance when HeldByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")
      await createTestBondHolderBalance(
        "0.0.6974684",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "5000",
      )

      const event = new HeldByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        {
          amount: "1000",
          expirationTimestamp: "1735689600",
          escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          to: "0xb3533f32594B689F19A94C608490451478F7197b",
          data: "0x",
        },
        "0x",
      )

      await eventBus.publishSync(event, HeldByPartitionDLTEvent.name)

      const savedBondHold = await bondHoldRepository.findOne({
        where: {
          id: 1,
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(savedBondHold).toBeDefined()
      expect(savedBondHold).not.toBeNull()
      expect(savedBondHold!.id).toBe(1)
      expect(savedBondHold!.contractId).toBe("0.0.6974684")
      expect(savedBondHold!.holderAccountId).toBe("0.0.7654321")
      expect(savedBondHold!.partition).toBe("0x7265736572766564000000000000000000000000000000000000000000000000")
      expect(savedBondHold!.amount).toBe("1000")
      expect(savedBondHold!.expirationTimestamp).toEqual(new Date(1735689600 * 1000))
      expect(savedBondHold!.escrowAccountId).toBe("0.0.9999999")
      expect(savedBondHold!.toAccountId).toBe("0.0.7654321")
      expect(savedBondHold!.data).toBe("0x")
      expect(savedBondHold!.operatorAccountId).toBe("0.0.1234567")

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(updatedBalance).toBeDefined()
      expect(updatedBalance!.availableBalance).toBe("4000")
      expect(updatedBalance!.heldBalance).toBe("1000")
    })

    it("should create a bond hold with no destination (address(0))", async () => {
      await createTestBond("0.0.6974684")
      await createTestBondHolderBalance(
        "0.0.6974684",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "5000",
      )

      const event = new HeldByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        {
          amount: "1000",
          expirationTimestamp: "1735689600",
          escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          to: "0x0000000000000000000000000000000000000000",
          data: "0x",
        },
        "0x",
      )

      await eventBus.publishSync(event, HeldByPartitionDLTEvent.name)

      const savedBondHold = await bondHoldRepository.findOne({
        where: {
          id: 1,
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(savedBondHold).toBeDefined()
      expect(savedBondHold!.toAccountId).toBe("0.0.0")
    })

    it("should throw BondHoldFoundError when bond hold with same holdId, contractId and holderAccountId already exists", async () => {
      await createTestBond("0.0.6974684")

      const existingBondHold = {
        id: 1,
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "500",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.9999999",
        toAccountId: "0.0.7654321",
        data: "0x",
        operatorData: "",
        operatorAccountId: "0.0.1234567",
      }

      await bondHoldRepository.save(existingBondHold)

      const event = new HeldByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        {
          amount: "1000",
          expirationTimestamp: "1735689600",
          escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          to: "0xb3533f32594B689F19A94C608490451478F7197b",
          data: "0x",
        },
        "0x",
      )

      await expect(eventBus.publishSync(event, HeldByPartitionDLTEvent.name)).rejects.toThrow(
        BondHoldFoundError.holdIdError(existingBondHold.contractId, existingBondHold.id),
      )
    })

    it("should create multiple bond holds with different holdIds successfully", async () => {
      await createTestBond("0.0.6974684")
      await createTestBondHolderBalance(
        "0.0.6974684",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "10000",
      )

      const holdIds = [1, 2, 3]

      for (const holdId of holdIds) {
        const event = new HeldByPartitionDLTEvent(
          "0.0.6974684",
          `0x123456789${holdId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          `${holdId}`,
          {
            amount: `${1000 * holdId}`,
            expirationTimestamp: "1735689600",
            escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
            to: "0xb3533f32594B689F19A94C608490451478F7197b",
            data: "0x",
          },
          "0x",
        )

        await eventBus.publishSync(event, HeldByPartitionDLTEvent.name)

        const savedBondHold = await bondHoldRepository.findOne({
          where: {
            id: holdId,
            contractId: "0.0.6974684",
            holderAccountId: "0.0.7654321",
            partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          },
        })

        expect(savedBondHold).toBeDefined()
        expect(savedBondHold).not.toBeNull()
        expect(savedBondHold!.id).toBe(holdId)
        expect(savedBondHold!.amount).toBe(`${1000 * holdId}`)
      }

      const allBondHolds = await bondHoldRepository.find()
      expect(allBondHolds).toHaveLength(holdIds.length)
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")
      await createTestBondHolderBalance(
        "0.0.6974684",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "5000",
      )

      const event = new HeldByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        {
          amount: "1000",
          expirationTimestamp: "1735689600",
          escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          to: "0xb3533f32594B689F19A94C608490451478F7197b",
          data: "0x",
        },
        "0x",
      )

      await eventBus.publishSync(event, HeldByPartitionDLTEvent.name)

      const savedBondHold = await bondHoldRepository.findOne({
        where: {
          id: 1,
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(savedBondHold).toBeDefined()
      expect(savedBondHold!.contractId).toMatch(/^0\.0\.\d+$/)
      expect(savedBondHold!.holderAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedBondHold!.escrowAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedBondHold!.toAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedBondHold!.operatorAccountId).toMatch(/^0\.0\.\d+$/)
    })

    it("should publish CreatedBondHoldEvent after successful bond hold creation", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      await createTestBond("0.0.6974684")
      await createTestBondHolderBalance(
        "0.0.6974684",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "5000",
      )

      const event = new HeldByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        {
          amount: "1000",
          expirationTimestamp: "1735689600",
          escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          to: "0xb3533f32594B689F19A94C608490451478F7197b",
          data: "0x",
        },
        "0x",
      )

      await eventBus.publishSync(event, HeldByPartitionDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          id: 1,
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          expirationTimestamp: new Date(1735689600 * 1000),
          escrowAccountId: "0.0.9999999",
          toAccountId: "0.0.7654321",
          data: "0x",
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

      // Create balance for each partition
      for (const partition of partitions) {
        await createTestBondHolderBalance("0.0.6974684", "0.0.7654321", partition, "5000")
      }

      for (let i = 0; i < partitions.length; i++) {
        const event = new HeldByPartitionDLTEvent(
          "0.0.6974684",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          partitions[i],
          "1",
          {
            amount: "1000",
            expirationTimestamp: "1735689600",
            escrow: "0xa1b2c3d4e5f6789012345678901234567890abcd",
            to: "0xb3533f32594B689F19A94C608490451478F7197b",
            data: "0x",
          },
          "0x",
        )

        await eventBus.publishSync(event, HeldByPartitionDLTEvent.name)

        const savedBondHold = await bondHoldRepository.findOne({
          where: { id: 1, contractId: "0.0.6974684", holderAccountId: "0.0.7654321", partition: partitions[i] },
        })

        expect(savedBondHold).toBeDefined()
        expect(savedBondHold!.partition).toBe(partitions[i])
      }

      const allBondHolds = await bondHoldRepository.find()
      expect(allBondHolds).toHaveLength(partitions.length)
    })
  })
})
