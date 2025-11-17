// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ClearedHoldByPartitionDLTEvent } from "@port/bond/usecase/clearedhold/model/ClearedHoldByPartitionDLTEvent"
import { BondClearingHoldPersistence } from "@port/bond/persistence/model/BondClearingHoldPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { ClearingFoundError } from "@domain/bond/clearing/errors/ClearingFoundError"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"
import { BondHolderBalancePersistence } from "@port/bond/persistence/model/BondHolderBalancePersistence"

describe("ClearedHoldNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let clearingHoldRepository: Repository<BondClearingHoldPersistence>
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
    clearingHoldRepository = app.get(getRepositoryToken(BondClearingHoldPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))

    // Mock the ConverterUtils to return consistent Hedera addresses
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.1234567",
        "0xb3533f32594B689F19A94C608490451478F7197b": "0.0.7654321",
        "0xa1b2c3d4e5f6789012345678901234567890abcd": "0.0.8888888",
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await clearingHoldRepository.clear()
    await bondHolderBalanceRepository.clear()
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ClearedHoldNestJSEventAdapter", () => {
    it("should create a new clearing hold when ClearedHoldByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new ClearedHoldByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        1735689600,
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedHoldByPartitionDLTEvent.name)

      const savedClearing = await clearingHoldRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(savedClearing).toBeDefined()
      expect(savedClearing).not.toBeNull()
      expect(savedClearing!.id).toBe(1)
      expect(savedClearing!.bondContractId).toBe("0.0.6974684")
      expect(savedClearing!.holderAccountId).toBe("0.0.7654321")
      expect(savedClearing!.partition).toBe("0x7265736572766564000000000000000000000000000000000000000000000000")
      expect(savedClearing!.amount).toBe("1000")
      expect(savedClearing!.expirationDate).toEqual(new Date(1735689600 * 1000))
      expect(savedClearing!.status).toBe(ClearingStatus.PENDING)
      expect(savedClearing!.operatorAccountId).toBe("0.0.1234567")
      expect(savedClearing!.toAccountId).toBe("0.0.8888888")
      expect(savedClearing!.escrowAccountId).toBe("0.0.8888888")
      expect(savedClearing!.data).toBe("0x1234")
      expect(savedClearing!.operatorData).toBe("0x5678")
    })

    it("should throw ClearingFoundError when clearing with same clearingId and bondContractId already exists", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const existingClearing = {
        id: 1,
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "500",
        expirationDate: new Date("2024-12-01"),
        status: ClearingStatus.PENDING,
        operatorAccountId: "0.0.1234567",
        toAccountId: "0.0.8888888",
        escrowAccountId: "0.0.8888888",
      }

      await clearingHoldRepository.save(existingClearing)

      const event = new ClearedHoldByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        1735689600,
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0x1234",
        "0x5678",
      )

      await expect(eventBus.publishSync(event, ClearedHoldByPartitionDLTEvent.name)).rejects.toThrow(ClearingFoundError)
    })

    it("should create multiple clearing holds with different clearingIds successfully", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "100000",
        lockedBalance: "0",
      })

      const clearingIds = [1, 2, 3]

      for (const clearingId of clearingIds) {
        const event = new ClearedHoldByPartitionDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId,
          `${1000 * clearingId}`,
          1735689600,
          "0xa1b2c3d4e5f6789012345678901234567890abcd",
          "0xa1b2c3d4e5f6789012345678901234567890abcd",
          "0x1234",
          "0x5678",
        )

        await eventBus.publishSync(event, ClearedHoldByPartitionDLTEvent.name)

        const savedClearing = await clearingHoldRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(savedClearing).toBeDefined()
        expect(savedClearing).not.toBeNull()
        expect(savedClearing!.id).toBe(clearingId)
        expect(savedClearing!.amount).toBe(`${1000 * clearingId}`)
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(clearingIds.length)
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

      const event = new ClearedHoldByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        1735689600,
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedHoldByPartitionDLTEvent.name)

      const savedClearing = await clearingHoldRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(savedClearing).toBeDefined()
      expect(savedClearing!.bondContractId).toMatch(/^0\.0\.\d+$/)
      expect(savedClearing!.holderAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedClearing!.operatorAccountId).toMatch(/^0\.0\.\d+$/)
    })

    it("should publish CreatedClearingEvent after successful clearing hold creation", async () => {
      const publishedEvents: any[] = []
      jest.spyOn(eventBus, "publish").mockImplementation((event) => {
        publishedEvents.push(event)
        void Promise.resolve()
      })

      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new ClearedHoldByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        "1000",
        1735689600,
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0xa1b2c3d4e5f6789012345678901234567890abcd",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedHoldByPartitionDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      const clearingCreatedEvent = publishedEvents.find((e) => e.constructor.name === "ClearingCreatedEvent")
      expect(clearingCreatedEvent).toBeDefined()
      expect(clearingCreatedEvent.clearing).toEqual(
        expect.objectContaining({
          id: 1,
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          expirationDate: new Date(1735689600 * 1000),
          status: ClearingStatus.PENDING,
          operatorAccountId: "0.0.1234567",
        }),
      )
      expect(clearingCreatedEvent.timestamp).toEqual(expect.any(Number))
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
        const event = new ClearedHoldByPartitionDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          partitions[i],
          i + 1,
          "1000",
          1735689600,
          "0xa1b2c3d4e5f6789012345678901234567890abcd",
          "0xa1b2c3d4e5f6789012345678901234567890abcd",
          "0x1234",
          "0x5678",
        )

        await eventBus.publishSync(event, ClearedHoldByPartitionDLTEvent.name)

        const savedClearing = await clearingHoldRepository.findOne({
          where: { id: i + 1, bondContractId: "0.0.6974684" },
        })

        expect(savedClearing).toBeDefined()
        expect(savedClearing!.partition).toBe(partitions[i])
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(partitions.length)
    })
  })
})
