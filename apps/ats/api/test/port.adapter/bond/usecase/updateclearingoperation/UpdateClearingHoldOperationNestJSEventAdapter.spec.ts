// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ClearingOperationApprovedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/bond/usecase/updateclearingoperation/model/ClearingOperationReclaimedDLTEvent"
import { BondClearingHoldPersistence } from "@port/bond/persistence/model/BondClearingHoldPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"
import { ClearingNotFoundError } from "@domain/bond/clearing/errors/ClearingNotFoundError"
import { BondHolderBalancePersistence } from "@port/bond/persistence/model/BondHolderBalancePersistence"

describe("UpdateClearingHoldOperationNestJSEventAdapter Integration", () => {
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
      nominalValueDecimals: 2,
      startingDate: new Date("2023-01-01"),
      maturityDate: new Date("2028-01-01"),
      maxSupply: "1000000",
    }
    return await bondRepository.save(bond)
  }

  const createTestClearing = async (
    id: number = 1,
    status: ClearingStatus = ClearingStatus.PENDING,
    holdId?: string,
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
      holdId,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  describe("ClearingOperationApprovedNestJSEventAdapter", () => {
    it("should approve a clearing hold when ClearingOperationApprovedDLTEvent is published", async () => {
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

      const event = new ClearingOperationApprovedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2, // ClearingOperationType.HOLD
      )

      await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

      const updatedClearing = await clearingHoldRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(updatedClearing).toBeDefined()
      expect(updatedClearing).not.toBeNull()
      expect(updatedClearing!.status).toBe(ClearingStatus.APPROVED)
    })

    it("should throw ClearingNotFoundError when clearing does not exist", async () => {
      await createTestBond("0.0.6974684")

      const event = new ClearingOperationApprovedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        999,
        2, // ClearingOperationType.HOLD
      )

      await expect(eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)).rejects.toThrow(
        ClearingNotFoundError,
      )
    })

    it("should publish ClearingApprovedEvent after approval", async () => {
      const publishedEvents: any[] = []
      jest.spyOn(eventBus, "publish").mockImplementation((event) => {
        publishedEvents.push(event)
        void Promise.resolve()
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

      const event = new ClearingOperationApprovedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2, // ClearingOperationType.HOLD
      )

      await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      expect(publishedEvents.some((e) => e.constructor.name === "ClearingApprovedEvent")).toBeTruthy()
    })

    it("should approve multiple clearing holds with different clearingIds successfully", async () => {
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
        const event = new ClearingOperationApprovedDLTEvent(
          "0.0.6974684",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId,
          2, // ClearingOperationType.HOLD
        )

        await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

        const updatedClearing = await clearingHoldRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(updatedClearing).toBeDefined()
        expect(updatedClearing!.status).toBe(ClearingStatus.APPROVED)
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(clearingIds.length)
      expect(allClearings.every((c) => c.status === ClearingStatus.APPROVED)).toBeTruthy()
    })

    it("should move balance from clearingBalance to heldBalance when clearing is approved", async () => {
      await createTestBond("0.0.6974684")
      await createTestClearing(1, ClearingStatus.PENDING)

      // Initial balance state
      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "9000",
        lockedBalance: "0",
        clearingBalance: "1000",
        heldBalance: "0",
      })

      const event = new ClearingOperationApprovedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2, // ClearingOperationType.HOLD
      )

      await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

      // Wait for async event processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      // Balance should move from clearing to held (CLEARING_EXECUTE operation)
      expect(updatedBalance).toBeDefined()
      expect(updatedBalance!.availableBalance).toBe("9000") // unchanged
      expect(updatedBalance!.clearingBalance).toBe("0") // 1000 - 1000
      expect(updatedBalance!.heldBalance).toBe("1000") // 0 + 1000
    })
  })

  describe("ClearingOperationReclaimedNestJSEventAdapter", () => {
    it("should delete a clearing hold when ClearingOperationReclaimedDLTEvent is published", async () => {
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

      const event = new ClearingOperationReclaimedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2,
      )

      await eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)

      const reclaimedClearing = await clearingHoldRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(reclaimedClearing).toBeDefined()
      expect(reclaimedClearing!.status).toBe(ClearingStatus.RECLAIMED)
    })

    it("should throw ClearingNotFoundError when clearing does not exist", async () => {
      await createTestBond("0.0.6974684")

      const event = new ClearingOperationReclaimedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        999,
        2,
      )

      await expect(eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)).rejects.toThrow(
        ClearingNotFoundError,
      )
    })

    it("should publish ClearingReclaimedEvent after reclaim", async () => {
      const publishedEvents: any[] = []
      jest.spyOn(eventBus, "publish").mockImplementation((event) => {
        publishedEvents.push(event)
        void Promise.resolve()
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

      const event = new ClearingOperationReclaimedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        1,
        2,
      )

      await eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      expect(publishedEvents.some((e) => e.constructor.name === "ClearingReclaimedEvent")).toBeTruthy()
    })

    it("should reclaim multiple clearing holds with different clearingIds successfully", async () => {
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
        const event = new ClearingOperationReclaimedDLTEvent(
          "0.0.6974684",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId,
          2,
        )

        await eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)

        const reclaimedClearing = await clearingHoldRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(reclaimedClearing).toBeDefined()
        expect(reclaimedClearing!.status).toBe(ClearingStatus.RECLAIMED)
      }

      const allClearings = await clearingHoldRepository.find()
      expect(allClearings).toHaveLength(clearingIds.length)
      expect(allClearings.every((c) => c.status === ClearingStatus.RECLAIMED)).toBeTruthy()
    })
  })
})
