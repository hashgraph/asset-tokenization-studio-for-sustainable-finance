// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { SetBondCouponTransactionRequest } from "@port/transaction/usecase/setbondcoupontransaction/model/SetBondCouponTransactionRequest"

describe("SetBondCouponTransaction API Integration", () => {
  let app: INestApplication
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
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /bonds/:bondContractId/coupons", () => {
    it("should create coupon transaction with valid data", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest: SetBondCouponTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rate: "500",
        rateDecimals: "2",
        rateStatus: "1",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
      expect((response.body as BuildTransactionResponse).unsignedTx.length).toBeGreaterThan(0)
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const setCouponRequest: SetBondCouponTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
          recordDate: new Date(1704067200000),
          executionDate: new Date(1704153600000),
          startDate: new Date(1672531200000),
          endDate: new Date(1704067200000),
          fixingDate: new Date(1703894400000),
          rate: "500",
          rateDecimals: "2",
          rateStatus: "1",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
          .send(setCouponRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different rate values correctly", async () => {
      const bondContractId = "0.0.67890"
      const rates = ["100", "500", "1000", "2500"]

      for (const rate of rates) {
        const setCouponRequest: SetBondCouponTransactionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          recordDate: new Date(1704067200000),
          executionDate: new Date(1704153600000),
          startDate: new Date(1672531200000),
          endDate: new Date(1704067200000),
          fixingDate: new Date(1703894400000),
          rate: rate,
          rateDecimals: "2",
          rateStatus: "1",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
          .send(setCouponRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle future dates correctly", async () => {
      const bondContractId = "0.0.67890"
      const now = Date.now()
      const oneMonthLater = now + 2592000000
      const twoMonthsLater = now + 5184000000
      const threeMonthsLater = now + 7776000000

      const setCouponRequest: SetBondCouponTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(oneMonthLater),
        executionDate: new Date(twoMonthsLater),
        startDate: new Date(now),
        endDate: new Date(oneMonthLater),
        fixingDate: new Date(threeMonthsLater),
        rate: "500",
        rateDecimals: "2",
        rateStatus: "1",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const setCouponRequest = {
          format: format,
          accountId: "0.0.5466269",
          recordDate: new Date(1704067200000),
          executionDate: new Date(1704153600000),
          rate: "500",
          rateDecimals: "2",
          startDate: new Date(1672531200000),
          endDate: new Date(1704067200000),
          fixingDate: new Date(1703894400000),
          rateStatus: "1",
        }

        await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
          .send(setCouponRequest)
          .expect(400)
      }
    })

    it("should return 400 for invalid recordDate (non-numeric)", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: "invalid-date",
        executionDate: new Date(1704153600000),
        rate: "500",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should return 400 for invalid executionDate (non-numeric)", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: "not-a-timestamp",
        rate: "500",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should return 400 for invalid rate (non-numeric)", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
        rate: "invalid-rate",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should return 400 for missing recordDate field", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        executionDate: new Date(1704153600000),
        rate: "500",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should return 400 for missing executionDate field", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        rate: "500",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should return 400 for missing rate field", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should return 400 for missing format field", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
        rate: "500",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should handle empty rate as invalid", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
        rate: "",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(400)
    })

    it("should handle zero rate as valid", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest: SetBondCouponTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
        rate: "0",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle large rate values", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest: SetBondCouponTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(1704067200000),
        executionDate: new Date(1704153600000),
        rate: "10000",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle different bond contract IDs", async () => {
      const bondContractIds = ["0.0.67890", "0.0.67891", "0.0.67892"]

      for (const bondContractId of bondContractIds) {
        const setCouponRequest: SetBondCouponTransactionRequest = {
          format: "hedera",
          accountId: "0.0.5466269",
          recordDate: new Date(1704067200000),
          executionDate: new Date(1704153600000),
          rate: "500",
          rateDecimals: "2",
          startDate: new Date(1672531200000),
          endDate: new Date(1704067200000),
          fixingDate: new Date(1703894400000),
          rateStatus: "1",
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
          .send(setCouponRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should create transaction with very long timestamp values", async () => {
      const bondContractId = "0.0.67890"
      const setCouponRequest: SetBondCouponTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        recordDate: new Date(9999999999000),
        executionDate: new Date(9999999999000),
        rate: "500",
        rateDecimals: "2",
        startDate: new Date(1672531200000),
        endDate: new Date(1704067200000),
        fixingDate: new Date(1703894400000),
        rateStatus: "1",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/ats/bonds/${bondContractId}/coupons`)
        .send(setCouponRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })
  })
})
