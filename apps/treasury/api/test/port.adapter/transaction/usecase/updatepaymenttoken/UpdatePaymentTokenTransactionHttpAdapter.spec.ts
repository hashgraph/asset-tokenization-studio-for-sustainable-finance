// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("UpdatePaymentTokenTransaction API Integration", () => {
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

  describe("PUT /treasuries/:treasuryContractId/payment-tokens", () => {
    it("should update payment token with valid treasuryContractId and paymentTokenContractId", async () => {
      const treasuryContractId = "0.0.123456"
      const updateRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        paymentTokenContractId: "0.0.789012",
      }

      const response = await request(app.getHttpServer())
        .put(`/api/v1/treasuries/${treasuryContractId}/payment-tokens`)
        .send(updateRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds and paymentTokenContractIds", async () => {
      const testCases = [
        {
          treasuryContractId: "0.0.123456",
          paymentTokenContractId: "0.0.789012",
        },
        {
          treasuryContractId: "0.0.654321",
          paymentTokenContractId: "0.0.210987",
        },
        {
          treasuryContractId: "0.0.999999",
          paymentTokenContractId: "0.0.111111",
        },
      ]

      for (const { treasuryContractId, paymentTokenContractId } of testCases) {
        const updateRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
          paymentTokenContractId,
        }

        const response = await request(app.getHttpServer())
          .put(`/api/v1/treasuries/${treasuryContractId}/payment-tokens`)
          .send(updateRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
      }
    })

    it("should handle different valid format values", async () => {
      const treasuryContractId = "0.0.123456"
      const formats = ["hedera", "ethereum"]

      for (const format of formats) {
        const updateRequest = {
          format,
          accountId: "0.0.123456789",
          paymentTokenContractId: "0.0.789012",
        }

        const response = await request(app.getHttpServer())
          .put(`/api/v1/treasuries/${treasuryContractId}/payment-tokens`)
          .send(updateRequest)
          .expect(200)

        expect(response.body).toHaveProperty("unsignedTx")
        expect(typeof response.body.unsignedTx).toBe("string")
      }
    })
  })
})
