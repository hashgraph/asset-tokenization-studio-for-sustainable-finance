// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("CreateOfferingTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer

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
    app.setGlobalPrefix("api/v1/")
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
    app.useLogger(false)
    await app.init()
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /primary-markets/:marketContractId/bonds/:bondContractId/offerings", () => {
    it("should create offering transaction with valid request data", async () => {
      const marketContractId = "0.0.67890"
      const bondContractId = "0.0.54321"
      const createOfferingRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        treasuryContractId: "0.0.12345",
        paymentTokenContractId: "0.0.67890",
        lotSize: "1000",
        minLots: "100",
        maxLots: "10000",
        targetLots: "5000",
        targetQuantityRule: 1,
        startDate: new Date(1640995200000),
        endDate: new Date(1672531200000),
        deadlineRule: 1,
        price: "100",
        priceDecimals: 2,
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`)
        .send(createOfferingRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const marketContractId = "0.0.67890"
      const bondContractId = "0.0.54321"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const createOfferingRequest = {
          format: format,
          accountId: "0.0.5466269",
          treasuryContractId: "0.0.12345",
          paymentTokenContractId: "0.0.67890",
          lotSize: "1000",
          minLots: "100",
          maxLots: "10000",
          targetLots: "5000",
          targetQuantityRule: 1,
          startDate: new Date(1640995200000),
          endDate: new Date(1672531200000),
          deadlineRule: 1,
          price: "100",
          priceDecimals: 2,
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`)
          .send(createOfferingRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.67890"
      const bondContractId = "0.0.54321"
      const invalidRequests = [
        {},
        { format: "hedera" },
        { format: "hedera", accountId: "0.0.12345" },
        { format: "hedera", accountId: "0.0.12345", treasuryContractId: "0.0.12345" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should reject invalid deadline rule", async () => {
      const marketContractId = "0.0.67890"
      const bondContractId = "0.0.54321"
      const createOfferingRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        treasuryContractId: "0.0.12345",
        paymentTokenContractId: "0.0.67890",
        lotSize: "1000",
        minLots: "100",
        maxLots: "10000",
        targetLots: "5000",
        targetQuantityRule: 1,
        startDate: new Date(1640995200000),
        endDate: new Date(1672531200000),
        deadlineRule: "-1",
        price: "100",
        priceDecimals: 2,
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`)
        .send(createOfferingRequest)
        .expect(400)
    })
  })
})
