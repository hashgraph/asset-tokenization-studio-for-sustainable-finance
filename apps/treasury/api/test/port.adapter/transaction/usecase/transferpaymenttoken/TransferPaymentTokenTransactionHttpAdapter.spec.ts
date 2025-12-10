// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("TransferPaymentTokenTransaction API Integration", () => {
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

  describe("POST /treasuries/{treasuryContractId}/payment-tokens/transfer", () => {
    const treasuryContractId = "0.0.123456789"
    const baseUrl = `/api/v1/treasuries/${treasuryContractId}/payment-tokens/transfer`

    it("should transfer payment token with valid data", async () => {
      const transferRequest = {
        toAccountId: "0.0.123456589",
        amount: "1000",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer()).post(baseUrl).send(transferRequest)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds", async () => {
      const testCases = ["0.0.123456789", "0.0.987654321", "0.0.555666777"]

      for (const treasuryId of testCases) {
        const transferRequest = {
          toAccountId: "0.0.123456589",
          amount: "500",
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const url = `/api/v1/treasuries/${treasuryId}/payment-tokens/transfer`
        const response = await request(app.getHttpServer()).post(url).send(transferRequest).expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different positive amounts", async () => {
      const amounts = ["1", "100", "1000", "999999"]

      for (const amount of amounts) {
        const transferRequest = {
          toAccountId: "0.0.123456589",
          amount,
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid to values", async () => {
      const toValues = ["0.0.123456589", "0.0.987654321", "0.0.555666777"]

      for (const to of toValues) {
        const transferRequest = {
          toAccountId: to,
          amount: "1000",
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer()).post(baseUrl).send(transferRequest)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const transferRequest = {
          toAccountId: "0.0.123456589",
          amount: "1000",
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer()).post(baseUrl).send(transferRequest)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should return 500 for invalid treasuryContractId", async () => {
      const invalidTreasuryId = "invalid-treasury-id"
      const transferRequest = {
        toAccountId: "0.0.123456589",
        amount: "1000",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const url = `/api/v1/treasuries/${invalidTreasuryId}/payment-tokens/transfer`
      await request(app.getHttpServer()).post(url).send(transferRequest).expect(500)
    })

    it("should return 400 for invalid format values", async () => {
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const transferRequest = {
          toAccountId: "0.0.123456589",
          amount: "1000",
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(400)
      }
    })

    it("should return 400 for negative amount", async () => {
      const transferRequest = {
        toAccountId: "0.0.123456589",
        amount: "-100",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(400)
    })

    it("should return 400 for zero amount", async () => {
      const transferRequest = {
        toAccountId: "0.0.123456589",
        amount: "0",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(400)
    })

    it("should return 400 for non-numeric amount", async () => {
      const invalidAmounts = ["abc", "1.5", "1,000", "1e10"]

      for (const amount of invalidAmounts) {
        const transferRequest = {
          toAccountId: "0.0.123456589",
          amount,
          format: "hedera",
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const invalidRequests = [
        {},
        { toAccountId: "0.0.123456589" },
        { amount: "1000" },
        { format: "hedera" },
        { accountId: "0.0.123456789" },
        { toAccountId: "0.0.123456589", amount: "1000" },
        { toAccountId: "0.0.123456589", format: "hedera" },
        { amount: "1000", format: "hedera" },
      ]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer()).post(baseUrl).send(invalidRequest).expect(400)
      }
    })

    it("should return 400 for empty to", async () => {
      const transferRequest = {
        toAccountId: "",
        amount: "1000",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(400)
    })

    it("should return 400 for empty amount", async () => {
      const transferRequest = {
        toAccountId: "0.0.123456589",
        amount: "",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(transferRequest).expect(400)
    })
  })
})
