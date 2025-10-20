// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("FundProceedsRecipientTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
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

  describe("POST /treasuries/{treasuryId}/proceeds-recipients/{recipientId}/transfer", () => {
    const treasuryId = "0.0.123456789"
    const recipientId = "0.0.123456589"
    const baseUrl = `/api/v1/treasuries/${treasuryId}/proceeds-recipients/${recipientId}/transfer`

    it("should fund proceeds recipient with valid data", async () => {
      const fundRequest = {
        amount: "1000",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer()).post(baseUrl).send(fundRequest)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryIds and recipientIds", async () => {
      const testCases = [
        {
          treasuryId: "0.0.123456789",
          recipientId: "0.0.123456589",
        },
        {
          treasuryId: "0.0.987654321",
          recipientId: "0.0.123456589",
        },
        {
          treasuryId: "0.0.555666777",
          recipientId: "0.0.123456589",
        },
      ]

      for (const { treasuryId, recipientId } of testCases) {
        const fundRequest = {
          amount: "500",
          format: "hedera",
          accountId: "0.0.123456789",
        }

        const url = `/api/v1/treasuries/${treasuryId}/proceeds-recipients/${recipientId}/transfer`
        const response = await request(app.getHttpServer()).post(url).send(fundRequest).expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different positive amounts", async () => {
      const amounts = ["1", "100", "1000", "999999"]

      for (const amount of amounts) {
        const fundRequest = {
          address: "0.0.123456589",
          amount,
          format: "hedera",
          accountId: "0.0.123456789",
          contractId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer()).post(baseUrl).send(fundRequest).expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const fundRequest = {
          amount: "1000",
          format,
          accountId: "0.0.123456789",
        }

        const response = await request(app.getHttpServer()).post(baseUrl).send(fundRequest)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should return 500 for invalid treasuryId", async () => {
      const invalidTreasuryId = "invalid-treasury-id"
      const validRecipientId = "0.0.123456589"
      const fundRequest = {
        amount: "1000",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const url = `/api/v1/treasuries/${invalidTreasuryId}/proceeds-recipients/${validRecipientId}/transfer`
      await request(app.getHttpServer()).post(url).send(fundRequest).expect(500)
    })

    it("should return 500 for invalid recipientId", async () => {
      const validTreasuryId = "0.0.123456789"
      const invalidRecipientId = "invalid-recipient-id"
      const fundRequest = {
        amount: "1000",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const url = `/api/v1/treasuries/${validTreasuryId}/proceeds-recipients/${invalidRecipientId}/transfer`
      await request(app.getHttpServer()).post(url).send(fundRequest).expect(500)
    })

    it("should return 400 for invalid format values", async () => {
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const fundRequest = {
          amount: "1000",
          format,
          accountId: "0.0.123456789",
        }

        await request(app.getHttpServer()).post(baseUrl).send(fundRequest).expect(400)
      }
    })

    it("should return 400 for negative amount", async () => {
      const fundRequest = {
        amount: "-100",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(fundRequest).expect(400)
    })

    it("should return 400 for zero amount", async () => {
      const fundRequest = {
        amount: "0",
        format: "hedera",
        accountId: "0.0.123456789",
      }

      await request(app.getHttpServer()).post(baseUrl).send(fundRequest).expect(400)
    })

    it("should return 400 for missing required fields", async () => {
      const invalidRequests = [{}, { amount: "1000" }, { format: "hedera" }, { accountId: "0.0.123456789" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer()).post(baseUrl).send(invalidRequest).expect(400)
      }
    })
  })
})
