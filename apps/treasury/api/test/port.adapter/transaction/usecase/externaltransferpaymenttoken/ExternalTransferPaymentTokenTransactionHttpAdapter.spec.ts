// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("ExternalTransferPaymentTokenTransaction API Integration", () => {
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

  describe("POST /payment-tokens/:paymentTokenContractId/treasuries/:treasuryContractId/transfer", () => {
    it("should create external payment token transfer in hedera format", async () => {
      const paymentTokenContractId = "0.0.123456"
      const treasuryContractId = "0.0.789012"
      const transferRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        amount: "10000000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/payment-tokens/${paymentTokenContractId}/treasuries/${treasuryContractId}/transfer`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should create external payment token transfer in ethereum format", async () => {
      const paymentTokenContractId = "0.0.123456"
      const treasuryContractId = "0.0.789012"
      const transferRequest = {
        format: "ethereum",
        accountId: "0.0.123456789",
        amount: "10000000",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/payment-tokens/${paymentTokenContractId}/treasuries/${treasuryContractId}/transfer`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
  })
})
