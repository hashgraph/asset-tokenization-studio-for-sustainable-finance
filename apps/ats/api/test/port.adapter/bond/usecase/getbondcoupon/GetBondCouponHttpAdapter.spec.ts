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

describe("GetBondCouponHttpAdapter API Integration", () => {
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

  describe("GET /:bondContractId/coupons/:couponId", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"
      const couponId = "1"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/coupons/${couponId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 404 Http error when coupon is not found", async () => {
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

      const couponId = "999"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/coupons/${couponId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return coupon details", async () => {
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

      const startDate = new Date("2025-01-01")
      const endDate = new Date("2025-06-30")
      const fixingDate = new Date("2025-06-15")

      const coupon = await internalBondCouponRepository.save({
        id: "1",
        bondContractId: bond.contractId,
        corporateActionId: `0x${Date.now().toString(16).padStart(64, "0")}`,
        operator: "0.0.123456",
        recordDate: recordDate,
        executionDate: executionDate,
        startDate: startDate,
        endDate: endDate,
        fixingDate: fixingDate,
        rate: "5.5",
        rateDecimals: "2",
        rateStatus: "1",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/coupons/${coupon.id}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        id: coupon.id,
        bondContractId: coupon.bondContractId,
        corporateActionId: coupon.corporateActionId,
        operator: coupon.operator,
        recordDate: recordDate.toISOString(),
        executionDate: executionDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        fixingDate: fixingDate.toISOString(),
        rate: coupon.rate,
        rateDecimals: coupon.rateDecimals,
        rateStatus: coupon.rateStatus,
      })
    })
  })
})
