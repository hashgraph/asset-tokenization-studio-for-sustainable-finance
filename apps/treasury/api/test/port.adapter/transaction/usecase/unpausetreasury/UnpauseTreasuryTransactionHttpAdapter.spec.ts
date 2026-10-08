// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("UnpauseTreasuryTransaction API Integration", () => {
  let app: INestApplication
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /treasuries/{treasuryContractId}/unpause", () => {
    const treasuryContractId = "0.0.123456789"
    const baseUrl = `/api/v1/treasuries/${treasuryContractId}/unpause`

    it("should unpause treasury with valid data", async () => {
      const unpauseRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer()).post(baseUrl).send(unpauseRequest)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds", async () => {
      const testCases = ["0.0.123456789", "0.0.987654321", "0.0.555666777"]

      for (const treasuryId of testCases) {
        const unpauseRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const url = `/api/v1/treasuries/${treasuryId}/unpause`
        const response = await request(app.getHttpServer()).post(url).send(unpauseRequest).expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const unpauseRequest = {
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer()).post(baseUrl).send(unpauseRequest)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle request without accountId for ethereum format", async () => {
      const unpauseRequest = {
        format: "ethereum",
      }

      const response = await request(app.getHttpServer()).post(baseUrl).send(unpauseRequest)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 500 for invalid treasuryContractId", async () => {
      const invalidTreasuryId = "invalid-treasury-id"
      const unpauseRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const url = `/api/v1/treasuries/${invalidTreasuryId}/unpause`
      await request(app.getHttpServer()).post(url).send(unpauseRequest).expect(500)
    })

    it("should return 400 for invalid format values", async () => {
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const unpauseRequest = {
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer()).post(baseUrl).send(unpauseRequest).expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const invalidRequests = [{}, { accountId: "0.0.123456789" }, { format: "hedera" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer()).post(baseUrl).send(invalidRequest).expect(400)
      }
    })

    it("should return 400 for empty format", async () => {
      const unpauseRequest = {
        format: "",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(unpauseRequest).expect(400)
    })
  })
})
