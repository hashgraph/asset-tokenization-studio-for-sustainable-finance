// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"

describe("DeployPrimaryMarketTransaction API Integration", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/")
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue("0.0.1234567")
    app.useLogger(false)
    await app.init()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /primary-markets", () => {
    it("should deploy primary market transaction with valid request data", async () => {
      const deployPrimaryMarketRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
        resolverContractId: "0.0.1111111",
        configVersion: 1,
      }

      const response = await request(app.getHttpServer())
        .post("/api/v1/primary-markets")
        .send(deployPrimaryMarketRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const deployPrimaryMarketRequest = {
          format: format,
          accountId: "0.0.5466269",
          resolverContractId: "0.0.1111111",
          configVersion: 1,
        }

        const response = await request(app.getHttpServer())
          .post("/api/v1/primary-markets")
          .send(deployPrimaryMarketRequest)
          .expect(201)

        expect(response.body as BuildTransactionResponse).toHaveProperty("unsignedTx")
      }
    })

    it("should return 400 for missing required fields", async () => {
      const invalidRequests = [
        {},
        { format: "hedera" },
        { format: "hedera", accountId: "0.0.12345" },
        { format: "hedera", accountId: "0.0.12345", resolverContractId: "0.0.1111111" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer()).post("/api/v1/primary-markets").send(invalidRequest).expect(400)
      }
    })

    it("should reject invalid configVersion type", async () => {
      const deployPrimaryMarketRequest = {
        format: "hedera",
        accountId: "0.0.12345",
        resolverContractId: "0.0.1111111",
        configVersion: "invalid",
      }

      await request(app.getHttpServer()).post("/api/v1/primary-markets").send(deployPrimaryMarketRequest).expect(400)
    })

    it("should reject invalid format value", async () => {
      const deployPrimaryMarketRequest = {
        format: "invalid-format",
        accountId: "0.0.12345",
        resolverContractId: "0.0.1111111",
        configVersion: 1,
      }

      await request(app.getHttpServer()).post("/api/v1/primary-markets").send(deployPrimaryMarketRequest).expect(400)
    })
  })
})
