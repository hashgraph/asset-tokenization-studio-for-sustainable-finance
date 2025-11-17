// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ClearingOperationCanceledDLTEvent } from "@port/bond/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"
import { BondClearingHoldPersistence } from "@port/bond/persistence/model/BondClearingHoldPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingHold"
import { ClearingNotFoundError } from "@domain/bond/clearing/errors/ClearingNotFoundError"
import { BondHolderBalancePersistence } from "@port/bond/persistence/model/BondHolderBalancePersistence"

describe("CancelClearingHoldOperationNestJSEventAdapter Integration", () => {
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

  const createTestClearing = async (
    id: number = 1,
    status: ClearingStatus = ClearingStatus.PENDING,
  ): Promise<BondClearingHoldPersistence> => {
    const clearing = {
      id,
      bondContractId: "0.0.6974684",
      holderAccountId: "0.0.7654321",
      partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
      amount: "1000",
      expirationDate: new Date("2025-12-31"),
      status,
      operatorAccountId: "0.0.1234567",
      toAccountId: "0.0.8888888",
      escrowAccountId: "0.0.8888888",
      data: "0x1234",
      operatorData: "0x5678",
    }
    return await clearingHoldRepository.save(clearing)
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

  describe("CancelClearingHoldOperationNestJSEventAdapter", () => {
    it("should cancel a clearing hold when ClearingOperationCanceledDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")
      await createTestClearing(1, ClearingStatus.PENDING)

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "0",
        clearingBalance: "1000",
        heldBalance: "0",
      })

      const event = new ClearingOperationCanceledDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2, // ClearingOperationType.HOLD
      )

      await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

      const canceledClearing = await clearingHoldRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(canceledClearing).toBeNull()
    })

    it("should throw ClearingNotFoundError when clearing does not exist", async () => {
      await createTestBond("0.0.6974684")

      const event = new ClearingOperationCanceledDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        999,
        2, // ClearingOperationType.HOLD
      )

      await expect(eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)).rejects.toThrow(
        ClearingNotFoundError,
      )
    })

    it("should publish ClearingCanceledEvent after cancellation", async () => {
      const publishedEvents: any[] = []
      jest.spyOn(eventBus, "publish").mockImplementation((event) => {
        publishedEvents.push(event)
        return Promise.resolve()
      })

      await createTestBond("0.0.6974684")
      await createTestClearing(1, ClearingStatus.PENDING)

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "0",
        clearingBalance: "1000",
        heldBalance: "0",
      })

      const event = new ClearingOperationCanceledDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2, // ClearingOperationType.HOLD
      )

      await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      expect(publishedEvents.some((e) => e.constructor.name === "ClearingCanceledEvent")).toBeTruthy()
    })

    it("should cancel multiple clearing holds with different clearingIds successfully", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "7000",
        lockedBalance: "0",
        clearingBalance: "3000",
        heldBalance: "0",
      })

      const clearingIds = [1, 2, 3]

      for (const clearingId of clearingIds) {
        await createTestClearing(clearingId, ClearingStatus.PENDING)
      }

      for (const clearingId of clearingIds) {
        const event = new ClearingOperationCanceledDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId,
          2, // ClearingOperationType.HOLD
        )

        await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

        const canceledClearing = await clearingHoldRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(canceledClearing).toBeNull()
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(0)
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")
      await createTestClearing(1, ClearingStatus.PENDING)

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "0",
        clearingBalance: "1000",
        heldBalance: "0",
      })

      const event = new ClearingOperationCanceledDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2, // ClearingOperationType.HOLD
      )

      await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

      // Verify that the clearing was deleted (address conversion was successful)
      const canceledClearing = await clearingHoldRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(canceledClearing).toBeNull()
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
          availableBalance: "9000",
          lockedBalance: "0",
          clearingBalance: "1000",
          heldBalance: "0",
        })
      }

      for (let i = 0; i < partitions.length; i++) {
        const clearing = {
          id: i + 1,
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: partitions[i],
          amount: "1000",
          expirationDate: new Date("2025-12-31"),
          status: ClearingStatus.PENDING,
          operatorAccountId: "0.0.1234567",
          toAccountId: "0.0.8888888",
          escrowAccountId: "0.0.8888888",
        }
        await clearingHoldRepository.save(clearing)
      }

      for (let i = 0; i < partitions.length; i++) {
        const event = new ClearingOperationCanceledDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          partitions[i],
          i + 1,
          2, // ClearingOperationType.HOLD
        )

        await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

        const canceledClearing = await clearingHoldRepository.findOne({
          where: { id: i + 1, bondContractId: "0.0.6974684" },
        })

        expect(canceledClearing).toBeNull()
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(0)
    })

    it("should handle cancellation of clearings in different statuses", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "8000",
        lockedBalance: "0",
        clearingBalance: "2000",
        heldBalance: "0",
      })

      // Create clearings with different statuses
      await createTestClearing(1, ClearingStatus.PENDING)
      await createTestClearing(2, ClearingStatus.APPROVED)

      // Cancel both clearings
      for (const clearingId of [1, 2]) {
        const event = new ClearingOperationCanceledDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId,
          2, // ClearingOperationType.HOLD
        )

        await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(0)
    })
  })
})
