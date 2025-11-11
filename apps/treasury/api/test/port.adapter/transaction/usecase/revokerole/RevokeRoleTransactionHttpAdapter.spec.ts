// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("RevokeRoleTransaction API Integration", () => {
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
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("DELETE /treasuries/:treasuryContractId/roles/:roleId/users/:userAccountId", () => {
    it("should create revoke role transaction in hedera format", async () => {
      const treasuryContractId = "0.0.789012"
      const roleId = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"
      const userAccountId = "0.0.3334"
      const transactionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/treasuries/${treasuryContractId}/roles/${roleId}/users/${userAccountId}`)
        .send(transactionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should create revoke role transaction in ethereum format", async () => {
      const treasuryContractId = "0.0.789012"
      const roleId = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"
      const userAccountId = "0.0.3334"
      const transactionRequest = {
        format: "ethereum",
        accountId: "0.0.123456789",
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/treasuries/${treasuryContractId}/roles/${roleId}/users/${userAccountId}`)
        .send(transactionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
  })
})
