// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "@components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondCouponPersistence } from "@port/coupon/persistence/model/BondCouponPersistence"

describe("GetBondCouponsHttpAdapter API Integration", () => {
  let app: INestApplication
  let internalBondRepository: Repository<BondPersistence>
  let internalBondCouponRepository: Repository<BondCouponPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    internalBondRepository = app.get(getRepositoryToken(BondPersistence))
    internalBondCouponRepository = app.get(getRepositoryToken(BondCouponPersistence))
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/coupons", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return empty paginated result when bond has no coupons", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/coupons`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        couponIds: [],
      })
    })

    it("should return paginated list of coupons with full details", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")
      const recordDate = new Date("2025-06-01")
      const executionDate = new Date("2025-06-15")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const corporateActionId1 = `0x${Date.now().toString(16).padStart(64, "0")}`
      const corporateActionId2 = `0x${(Date.now() + 1).toString(16).padStart(64, "0")}`

      await internalBondCouponRepository.save({
        id: "1",
        bondContractId: bond.contractId,
        corporateActionId: corporateActionId1,
        operator: "0.0.123456",
        recordDate: recordDate,
        executionDate: executionDate,
        rate: "5.5",
        rateDecimals: "2",
        period: "2592000",
      })

      const recordDate2 = new Date("2025-12-01")
      const executionDate2 = new Date("2025-12-15")
      await internalBondCouponRepository.save({
        id: "2",
        bondContractId: bond.contractId,
        corporateActionId: corporateActionId2,
        operator: "0.0.123456",
        recordDate: recordDate2,
        executionDate: executionDate2,
        rate: "5.5",
        rateDecimals: "2",
        period: "2592000",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/coupons`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.couponIds).toHaveLength(2)
      const couponIds = response.body.couponIds.sort()
      expect(couponIds).toEqual(["1", "2"])
    })

    it("should respect pagination parameters", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      for (let i = 1; i <= 5; i++) {
        await internalBondCouponRepository.save({
          id: i.toString(),
          bondContractId: bond.contractId,
          corporateActionId: `0x${(Date.now() + i).toString(16).padStart(64, "0")}`,
          operator: "0.0.123456",
          recordDate: new Date("2025-06-01"),
          executionDate: new Date("2025-06-15"),
          rate: "5.5",
          rateDecimals: "2",
          period: "2592000",
        })
      }

      // This requests page 1 with limit 2
      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/coupons?page=1&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.couponIds).toHaveLength(2)

      // This requests page 2 with limit 2
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/coupons?page=2&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response2.body.couponIds).toHaveLength(2)

      // Verify that different pages return different coupon IDs
      const page1Ids = response.body.couponIds.sort()
      const page2Ids = response2.body.couponIds.sort()
      expect(page1Ids).not.toEqual(page2Ids)
    })
  })
})
