// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ClearingOperationApprovedDLTEvent } from "@port/clearing/usecase/updateclearingoperation/model/ClearingOperationApprovedDLTEvent"
import { ClearingOperationReclaimedDLTEvent } from "@port/clearing/usecase/updateclearingoperation/model/ClearingOperationReclaimedDLTEvent"
import { ClearingOperationCanceledDLTEvent } from "@port/clearing/usecase/cancelclearingoperation/model/ClearingOperationCanceledDLTEvent"
import { BondClearingRedeemPersistence } from "@port/clearing/persistence/model/BondClearingRedeemPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"
import { ClearingNotFoundError } from "@domain/clearing/errors/ClearingNotFoundError"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"

describe("UpdateClearingRedeemOperationNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let clearingRedeemRepository: Repository<BondClearingRedeemPersistence>
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
  ): Promise<BondClearingRedeemPersistence> => {
    const clearing = {
      id,
      bondContractId: "0.0.6974684",
      holderAccountId: "0.0.7654321",
      partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
      amount: "1000",
      expirationDate: new Date("2025-12-31"),
      status,
      operatorAccountId: "0.0.1234567",
      data: "0x1234",
      operatorData: "0x5678",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return await clearingRedeemRepository.save(clearing)
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
    clearingRedeemRepository = app.get(getRepositoryToken(BondClearingRedeemPersistence))
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
    await clearingRedeemRepository.clear()
    await bondHolderBalanceRepository.clear()
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ClearingOperationApprovedNestJSEventAdapter for REDEEM", () => {
    it("should approve a clearing redeem when ClearingOperationApprovedDLTEvent is published with REDEEM type", async () => {
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
        "1",
        1, // ClearingOperationType.REDEEM
        "1",
      )

      await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

      const updatedClearing = await clearingRedeemRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(updatedClearing).toBeDefined()
      expect(updatedClearing).not.toBeNull()
      expect(updatedClearing!.status).toBe(ClearingStatus.APPROVED)
    })

    it("should throw ClearingNotFoundError when clearing redeem does not exist", async () => {
      await createTestBond("0.0.6974684")

      const event = new ClearingOperationApprovedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "999",
        1, // ClearingOperationType.REDEEM,
        "1",
      )

      await expect(eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)).rejects.toThrow(
        ClearingNotFoundError,
      )
    })

    it("should publish ClearingApprovedEvent after redeem approval", async () => {
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
        "1",
        1, // ClearingOperationType.REDEEM,
        "1",
      )

      await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      expect(publishedEvents.some((e) => e.constructor.name === "ClearingApprovedEvent")).toBeTruthy()
    })

    it("should approve multiple clearing redeems with different clearingIds successfully", async () => {
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
          clearingId.toString(),
          1, // ClearingOperationType.REDEEM,
          "1",
        )

        await eventBus.publishSync(event, ClearingOperationApprovedDLTEvent.name)

        const updatedClearing = await clearingRedeemRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(updatedClearing).toBeDefined()
        expect(updatedClearing!.status).toBe(ClearingStatus.APPROVED)
      }

      const allClearings = await clearingRedeemRepository.find()
      expect(allClearings).toHaveLength(clearingIds.length)
      expect(allClearings.every((c) => c.status === ClearingStatus.APPROVED)).toBeTruthy()
    })
  })

  describe("ClearingOperationReclaimedNestJSEventAdapter for REDEEM", () => {
    it("should reclaim a clearing redeem when ClearingOperationReclaimedDLTEvent is published with REDEEM type", async () => {
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
        "1",
        1, // ClearingOperationType.REDEEM
      )

      await eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)

      const updatedClearing = await clearingRedeemRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(updatedClearing).toBeDefined()
      expect(updatedClearing).not.toBeNull()
      expect(updatedClearing!.status).toBe(ClearingStatus.RECLAIMED)
    })

    it("should throw ClearingNotFoundError when clearing redeem does not exist for reclaim", async () => {
      await createTestBond("0.0.6974684")

      const event = new ClearingOperationReclaimedDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "999",
        1, // ClearingOperationType.REDEEM
      )

      await expect(eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)).rejects.toThrow(
        ClearingNotFoundError,
      )
    })

    it("should publish ClearingReclaimedEvent after redeem reclaim", async () => {
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
        "1",
        1, // ClearingOperationType.REDEEM
      )

      await eventBus.publishSync(event, ClearingOperationReclaimedDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      expect(publishedEvents.some((e) => e.constructor.name === "ClearingReclaimedEvent")).toBeTruthy()
    })
  })

  describe("ClearingOperationCanceledNestJSEventAdapter for REDEEM", () => {
    it("should cancel a clearing redeem when ClearingOperationCanceledDLTEvent is published with REDEEM type", async () => {
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
        "1",
        1, // ClearingOperationType.REDEEM
      )

      await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

      const canceledClearing = await clearingRedeemRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(canceledClearing).toBeNull()
    })

    it("should throw ClearingNotFoundError when clearing redeem does not exist for cancel", async () => {
      await createTestBond("0.0.6974684")

      const event = new ClearingOperationCanceledDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "999",
        1, // ClearingOperationType.REDEEM
      )

      await expect(eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)).rejects.toThrow(
        ClearingNotFoundError,
      )
    })

    it("should publish ClearingCanceledEvent after redeem cancellation", async () => {
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

      const event = new ClearingOperationCanceledDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        1, // ClearingOperationType.REDEEM
      )

      await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      expect(publishedEvents.some((e) => e.constructor.name === "ClearingCanceledEvent")).toBeTruthy()
    })

    it("should cancel multiple clearing redeems with different clearingIds successfully", async () => {
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
          clearingId.toString(),
          1, // ClearingOperationType.REDEEM
        )

        await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

        const canceledClearing = await clearingRedeemRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(canceledClearing).toBeNull()
      }

      const allClearings = await clearingRedeemRepository.find()
      expect(allClearings).toHaveLength(0)
    })

    it("should convert EVM addresses to Hedera addresses correctly for cancel", async () => {
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
        "1",
        1, // ClearingOperationType.REDEEM
      )

      await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

      // Verify that the clearing was deleted (address conversion was successful)
      const canceledClearing = await clearingRedeemRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(canceledClearing).toBeNull()
    })

    it("should handle different partitions for the same bond for cancel", async () => {
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
          data: "0x1234",
          operatorData: "0x5678",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await clearingRedeemRepository.save(clearing)
      }

      for (let i = 0; i < partitions.length; i++) {
        const event = new ClearingOperationCanceledDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          partitions[i],
          (i + 1).toString(),
          1, // ClearingOperationType.REDEEM
        )

        await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)

        const canceledClearing = await clearingRedeemRepository.findOne({
          where: { id: i + 1, bondContractId: "0.0.6974684" },
        })

        expect(canceledClearing).toBeNull()
      }

      const allClearings = await clearingRedeemRepository.find()
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
          clearingId.toString(),
          1, // ClearingOperationType.REDEEM
        )

        await eventBus.publishSync(event, ClearingOperationCanceledDLTEvent.name)
      }

      const allClearings = await clearingRedeemRepository.find()
      expect(allClearings).toHaveLength(0)
    })
  })
})
