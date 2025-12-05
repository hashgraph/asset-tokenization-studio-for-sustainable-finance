// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondCouponPersistence } from "@port/coupon/persistence/model/BondCouponPersistence"
import { CouponSetDLTEvent } from "@port/coupon/usecase/setbondcoupon/model/CouponSetDLTEvent"
import { BondNotFoundError } from "@domain/bond/errors/BondNotFoundError"

describe("SetBondCouponNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const CORPORATE_ACTION_ID = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  const OPERATOR = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"

  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let bondCouponRepository: Repository<BondCouponPersistence>

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
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondCouponRepository = app.get(getRepositoryToken(BondCouponPersistence))

    await bondRepository.save({
      contractId: CONTRACT_ID,
      treasuryId: "0.0.6823801",
      kpiId: "0.0.6974684",
      name: "Green Bond",
      symbol: "GBND",
      decimals: 18,
      currency: "USD",
      nominalValue: "1000",
      nominalValueDecimals: 2,
      startingDate: new Date("2025-01-01"),
      maturityDate: new Date("2030-01-01"),
      maxSupply: "1000000",
      isin: "US1234567890",
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondCouponRepository.clear()
    await bondRepository.clear()
    await app.close()
  })

  describe("SetBondCouponNestJSEventAdapter", () => {
    it("should create a new coupon when CouponSetDLTEvent is published", async () => {
      const event = new CouponSetDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        CORPORATE_ACTION_ID,
        "1",
        OPERATOR,
        "1704067200",
        "1704153600",
        "500",
        "2",
        "2592000",
      )

      await eventBus.publishSync(event, CouponSetDLTEvent.name)

      const savedCoupon = await bondCouponRepository.findOne({
        where: { contractId: CONTRACT_ID, couponId: "1" },
      })

      expect(savedCoupon).toBeDefined()
      expect(savedCoupon).not.toBeNull()
      expect(savedCoupon!.contractId).toBe(CONTRACT_ID)
      expect(savedCoupon!.corporateActionId).toBe(CORPORATE_ACTION_ID)
      expect(savedCoupon!.couponId).toBe("1")
      expect(savedCoupon!.operator).toBe(OPERATOR)
      expect(savedCoupon!.recordDate).toEqual(new Date(1704067200 * 1000))
      expect(savedCoupon!.executionDate).toEqual(new Date(1704153600 * 1000))
      expect(savedCoupon!.rate).toBe("500")
      expect(savedCoupon!.rateDecimals).toBe("2")
      expect(savedCoupon!.period).toBe("2592000")
    })

    it("should not duplicate coupon when CouponSetDLTEvent is published twice with same couponId", async () => {
      const event = new CouponSetDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        CORPORATE_ACTION_ID,
        "1",
        OPERATOR,
        "1704067200",
        "1704153600",
        "500",
        "2",
        "2592000",
      )

      await eventBus.publishSync(event, CouponSetDLTEvent.name)
      await eventBus.publishSync(event, CouponSetDLTEvent.name)

      const allCoupons = await bondCouponRepository.find({
        where: { contractId: CONTRACT_ID, couponId: "1" },
      })

      expect(allCoupons).toHaveLength(1)
      expect(allCoupons[0].contractId).toBe(CONTRACT_ID)
      expect(allCoupons[0].couponId).toBe("1")
    })

    it("should create multiple coupons for the same bond with different couponIds", async () => {
      const couponIds = ["1", "2", "3"]

      for (const couponId of couponIds) {
        const event = new CouponSetDLTEvent(
          CONTRACT_ID,
          "0x1234567890abcdef",
          CORPORATE_ACTION_ID,
          couponId,
          OPERATOR,
          `170406720${couponId}`,
          `170415360${couponId}`,
          "500",
          "2",
          "2592000",
        )

        await eventBus.publishSync(event, CouponSetDLTEvent.name)

        const savedCoupon = await bondCouponRepository.findOne({
          where: { contractId: CONTRACT_ID, couponId },
        })

        expect(savedCoupon).toBeDefined()
        expect(savedCoupon).not.toBeNull()
        expect(savedCoupon!.contractId).toBe(CONTRACT_ID)
        expect(savedCoupon!.couponId).toBe(couponId)
      }

      const allCoupons = await bondCouponRepository.find({
        where: { contractId: CONTRACT_ID },
      })
      expect(allCoupons).toHaveLength(couponIds.length)
    })

    it("should create coupons for different bonds successfully", async () => {
      const contractId2 = "0.0.6974685"
      await bondRepository.save({
        contractId: contractId2,
        treasuryId: "0.0.6823802",
        kpiId: "0.0.6974685",
        name: "Green Bond 2",
        symbol: "GBND2",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US9876543210",
      })

      const contracts = [CONTRACT_ID, contractId2]

      for (const contractId of contracts) {
        const event = new CouponSetDLTEvent(
          contractId,
          "0x1234567890abcdef",
          CORPORATE_ACTION_ID,
          "1",
          OPERATOR,
          "1704067200",
          "1704153600",
          "500",
          "2",
          "2592000",
        )

        await eventBus.publishSync(event, CouponSetDLTEvent.name)

        const savedCoupon = await bondCouponRepository.findOne({
          where: { contractId, couponId: "1" },
        })

        expect(savedCoupon).toBeDefined()
        expect(savedCoupon).not.toBeNull()
        expect(savedCoupon!.contractId).toBe(contractId)
        expect(savedCoupon!.couponId).toBe("1")
      }

      const allCoupons = await bondCouponRepository.find()
      expect(allCoupons).toHaveLength(contracts.length)
    })

    it("should publish BondCouponSetEvent after successful coupon creation", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new CouponSetDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        CORPORATE_ACTION_ID,
        "1",
        OPERATOR,
        "1704067200",
        "1704153600",
        "500",
        "2",
        "2592000",
      )

      await eventBus.publishSync(event, CouponSetDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: CONTRACT_ID,
          corporateActionId: CORPORATE_ACTION_ID,
          couponId: "1",
          operator: OPERATOR,
          recordDate: new Date(1704067200 * 1000),
          executionDate: new Date(1704153600 * 1000),
          rate: "500",
          rateDecimals: "2",
          period: "2592000",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should throw BondNotFoundError when bond does not exist", async () => {
      const nonExistentContractId = "0.0.9999999"

      const event = new CouponSetDLTEvent(
        nonExistentContractId,
        "0x1234567890abcdef",
        CORPORATE_ACTION_ID,
        "1",
        OPERATOR,
        "1704067200",
        "1704153600",
        "500",
        "2",
        "2592000",
      )

      await expect(eventBus.publishSync(event, CouponSetDLTEvent.name)).rejects.toThrow(
        BondNotFoundError.contractIdError(nonExistentContractId),
      )
    })

    it("should handle different rate values correctly", async () => {
      const rates = ["100", "500", "1000", "2500"]

      for (let i = 0; i < rates.length; i++) {
        const event = new CouponSetDLTEvent(
          CONTRACT_ID,
          "0x1234567890abcdef",
          CORPORATE_ACTION_ID,
          String(i + 1),
          OPERATOR,
          "1704067200",
          "1704153600",
          rates[i],
          "2",
          "2592000",
        )

        await eventBus.publishSync(event, CouponSetDLTEvent.name)

        const savedCoupon = await bondCouponRepository.findOne({
          where: { contractId: CONTRACT_ID, couponId: String(i + 1) },
        })

        expect(savedCoupon).toBeDefined()
        expect(savedCoupon!.rate).toBe(rates[i])
      }
    })

    it("should handle sequential coupons with increasing dates", async () => {
      const baseRecordDate = 1704067200
      const baseExecutionDate = 1704153600
      const monthInSeconds = 2592000

      for (let i = 0; i < 3; i++) {
        const event = new CouponSetDLTEvent(
          CONTRACT_ID,
          "0x1234567890abcdef",
          CORPORATE_ACTION_ID,
          String(i + 1),
          OPERATOR,
          String(baseRecordDate + i * monthInSeconds),
          String(baseExecutionDate + i * monthInSeconds),
          "500",
          "2",
          "2592000",
        )

        await eventBus.publishSync(event, CouponSetDLTEvent.name)
      }

      const allCoupons = await bondCouponRepository.find({
        where: { contractId: CONTRACT_ID },
        order: { couponId: "ASC" },
      })

      expect(allCoupons).toHaveLength(3)
      expect(allCoupons[0].recordDate.getTime()).toBeLessThan(allCoupons[1].recordDate.getTime())
      expect(allCoupons[1].recordDate.getTime()).toBeLessThan(allCoupons[2].recordDate.getTime())
    })
  })
})
