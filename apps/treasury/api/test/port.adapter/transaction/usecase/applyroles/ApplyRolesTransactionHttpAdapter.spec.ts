// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("ApplyRolesTransaction API Integration", () => {
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

  describe("POST /treasuries/:treasuryContractId/users/:userAccountId/roles", () => {
    it("should create apply roles transaction in hedera format", async () => {
      const treasuryContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const roleGrant = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"
      const roleRevoke = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: [roleGrant],
        rolesToRevoke: [roleRevoke],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should create apply roles transaction in ethereum format", async () => {
      const treasuryContractId = "0.0.789012"
      const userAccountId = "0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7"
      const roleGrant = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"
      const roleRevoke = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const requestBody = {
        format: "ethereum",
        rolesToGrant: [roleGrant],
        rolesToRevoke: [roleRevoke],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })
  })
})
