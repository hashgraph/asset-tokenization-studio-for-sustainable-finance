// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { AppModule } from "../../../../../src/AppModule"
import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"

describe("FundProceedsRecipientTransaction API Integration", () => {
  let app: INestApplication

  beforeEach(async () => {
    // Mock only the external dependency that's not implemented yet
    const mockTransactionBuilderAdapter = {
      fundProceedsRecipient: jest.fn().mockReturnValue(new BuildTransactionResponse("mocked-serialized-transaction")),
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider("TransactionBuilderPort")
      .useValue(mockTransactionBuilderAdapter)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe("POST /proceeds-recipients/fund", () => {
    it("should fund proceeds recipient with valid hexadecimal address and positive amount", async () => {
      const fundRequest = {
        address: "0x1234567890abcdef",
        amount: 1000,
        format: "hedera",
      }

      const response = await request(app.getHttpServer())
        .post("/proceeds-recipients/fund")
        .send(fundRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid hexadecimal addresses", async () => {
      const addresses = ["0x1234567890abcdef", "0xABCDEF1234567890", "0xdeadbeefcafebabe"]

      for (const address of addresses) {
        const fundRequest = {
          address,
          amount: 500,
          format: "hedera",
        }

        const response = await request(app.getHttpServer())
          .post("/proceeds-recipients/fund")
          .send(fundRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different positive amounts", async () => {
      const amounts = [1, 100, 1000, 999999]

      for (const amount of amounts) {
        const fundRequest = {
          address: "0x1234567890abcdef",
          amount,
          format: "hedera",
        }

        const response = await request(app.getHttpServer())
          .post("/proceeds-recipients/fund")
          .send(fundRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const fundRequest = {
          address: "0x1234567890abcdef",
          amount: 1000,
          format,
        }

        const response = await request(app.getHttpServer())
          .post("/proceeds-recipients/fund")
          .send(fundRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should reject invalid hexadecimal address", async () => {
      const fundRequest = {
        address: "invalid-address",
        amount: 1000,
        format: "hedera",
      }

      await request(app.getHttpServer()).post("/proceeds-recipients/fund").send(fundRequest).expect(400)
    })

    it("should return 400 for invalid format values", async () => {
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const fundRequest = {
          address: "0x1234567890abcdef",
          amount: 1000,
          format,
        }

        await request(app.getHttpServer()).post("/proceeds-recipients/fund").send(fundRequest).expect(400)
      }
    })

    it("should reject non-positive amounts", async () => {
      const invalidAmounts = [0, -1, -100]

      for (const amount of invalidAmounts) {
        const fundRequest = {
          address: "0x1234567890abcdef",
          amount,
          format: "hedera",
        }

        await request(app.getHttpServer()).post("/proceeds-recipients/fund").send(fundRequest).expect(400)
      }
    })

    it("should return 400 for missing required fields", async () => {
      const invalidRequests = [{}, { address: "0x1234567890abcdef" }, { amount: 1000 }, { format: "hedera" }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer()).post("/proceeds-recipients/fund").send(invalidRequest).expect(400)
      }
    })
  })
})
