// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { BuildTransactionResponse, ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { RemoveControlListMemberTransactionRequest } from "@port/transaction/usecase/removecontrollistmembertransaction/model/RemoveControlListMemberTransactionRequest"

describe("RemoveControlListMemberTransaction API Integration", () => {
  let app: INestApplication
  beforeEach(async () => {
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      if (address === "invalid-holder") {
        return Promise.reject(new Error("Invalid EVM address"))
      }
      return Promise.resolve("0.0.12345")
    })
    jest.spyOn(ConverterUtils, "getEvmAddressFromHederaAddress").mockImplementation((address: string) => {
      if (address === "invalid-holder") {
        return Promise.reject(new Error("Invalid Hedera address"))
      }
      return Promise.resolve("0x0000000000000000000000000000000000003039")
    })
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

  describe("DELETE /bonds/:bondContractId/control-list/:holderAccountId", () => {
    it("should delete control list member with valid data", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039" // EVM address format
      const deleteControlListMemberRequest: RemoveControlListMemberTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`)
        .send(deleteControlListMemberRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof (response.body as BuildTransactionResponse).unsignedTx).toBe("string")
    })

    it("should handle different valid format values", async () => {
      const bondContractId = "0.0.67890"
      const formats = ["hedera", "ethereum"]
      const holderAccountIds = [
        "0x0000000000000000000000000000000000003039",
        "0x000000000000000000000000000000000000303a",
      ]

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i]
        const holderAccountId = holderAccountIds[i]

        const deleteControlListMemberRequest: RemoveControlListMemberTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`)
          .send(deleteControlListMemberRequest)
          .expect(200)
      }
    })

    it("should return 400 for invalid format values", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const invalidFormats = ["json", "hex", "base64", "xml", "invalid"]

      for (const format of invalidFormats) {
        const deleteControlListMemberRequest: RemoveControlListMemberTransactionRequest = {
          format: format,
          accountId: "0.0.5466269",
        }

        await request(app.getHttpServer())
          .delete(`/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`)
          .send(deleteControlListMemberRequest)
          .expect(400)
      }
    })

    it("should return 500 for invalid bondContractId", async () => {
      const invalidBondContractId = "invalid-id"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const deleteControlListMemberRequest: RemoveControlListMemberTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${invalidBondContractId}/control-list/${holderAccountId}`)
        .send(deleteControlListMemberRequest)
        .expect(500)
    })

    it("should return 500 for invalid holderAccountId", async () => {
      const bondContractId = "0.0.67890"
      const invalidHolderAccountId = "invalid-holder"
      const deleteControlListMemberRequest: RemoveControlListMemberTransactionRequest = {
        format: "hedera",
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/control-list/${invalidHolderAccountId}`)
        .send(deleteControlListMemberRequest)
        .expect(500)
    })

    it("should return 400 for missing required fields", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const deleteControlListMemberRequest = {
        accountId: "0.0.5466269",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`)
        .send(deleteControlListMemberRequest)
        .expect(400)
    })

    it("should return 400 for request without accountId", async () => {
      const bondContractId = "0.0.67890"
      const holderAccountId = "0x0000000000000000000000000000000000003039"
      const deleteControlListMemberRequest: Partial<RemoveControlListMemberTransactionRequest> = {
        format: "hedera",
      }

      await request(app.getHttpServer())
        .delete(`/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`)
        .send(deleteControlListMemberRequest)
        .expect(400)
    })
  })
})
