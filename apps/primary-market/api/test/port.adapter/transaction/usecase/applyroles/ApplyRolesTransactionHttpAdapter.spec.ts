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
    app.useLogger(false)
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

  describe("POST /primary-markets/:marketContractId/users/:userAccountId/roles", () => {
    it("should create apply roles transaction in hedera format", async () => {
      const marketContractId = "0.0.789012"
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
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should create apply roles transaction in ethereum format", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7"
      const roleGrant = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"
      const roleRevoke = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const requestBody = {
        format: "ethereum",
        rolesToGrant: [roleGrant],
        rolesToRevoke: [roleRevoke],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle empty rolesToGrant array", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const roleRevoke = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: [],
        rolesToRevoke: [roleRevoke],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle empty rolesToRevoke array", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const roleGrant = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: [roleGrant],
        rolesToRevoke: [],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle multiple roles to grant and revoke", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const rolesToGrant = [
        "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      ]
      const rolesToRevoke = [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ]

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant,
        rolesToRevoke,
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should return 400 for invalid format", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"

      const requestBody = {
        format: "invalid",
        accountId: userAccountId,
        rolesToGrant: [],
        rolesToRevoke: [],
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 for missing required fields", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const invalidRequests = [{}, { format: "hedera" }, { accountId: userAccountId }]

      for (const invalidRequest of invalidRequests) {
        await request(app.getHttpServer())
          .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
          .send(invalidRequest)
          .expect(400)
      }
    })

    it("should return 400 when rolesToGrant is not an array", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: "not-an-array",
        rolesToRevoke: [],
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 when rolesToRevoke is not an array", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: [],
        rolesToRevoke: "not-an-array",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(400)
    })

    it("should handle both arrays empty simultaneously", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: [],
        rolesToRevoke: [],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle missing rolesToGrant field", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const roleRevoke = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToRevoke: [roleRevoke],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })

    it("should handle missing rolesToRevoke field", async () => {
      const marketContractId = "0.0.789012"
      const userAccountId = "0.0.123456789"
      const roleGrant = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb"

      const requestBody = {
        format: "hedera",
        accountId: userAccountId,
        rolesToGrant: [roleGrant],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`)
        .send(requestBody)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
    })
  })
})
