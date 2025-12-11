// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { PageResponse, QueryBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { GetRoleMemberResponse } from "@port/primarymarketfactory/usecase/getprimarymarketfactoryrolemembers/model/GetRoleMemberResponse"

describe("GetPrimaryMarketFactoryRoleMembers API Integration", () => {
  let app: INestApplication
  let queryBus: QueryBus

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/")
    app.useLogger(false)
    await app.init()

    queryBus = app.get("QueryBus")
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /primary-markets/factories/:factoryContractId/roles/:roleId/members", () => {
    it("should return role members with pagination", async () => {
      const factoryContractId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"

      const mockResponse: PageResponse<GetRoleMemberResponse> = {
        items: [{ userAccountId: "0.0.12345" }, { userAccountId: "0.0.12346" }],
        total: 2,
        page: 0,
        limit: 10,
        totalPages: 1,
      }

      jest.spyOn(queryBus, "execute").mockResolvedValue(mockResponse)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/factories/${factoryContractId}/roles/${roleId}/members`)
        .expect(200)

      expect(response.body).toEqual(mockResponse)
      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0]).toHaveProperty("userAccountId")
    })

    it("should handle pagination parameters", async () => {
      const factoryContractId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"

      const mockResponse: PageResponse<GetRoleMemberResponse> = {
        items: [{ userAccountId: "0.0.12345" }],
        total: 10,
        page: 1,
        limit: 5,
        totalPages: 2,
      }

      jest.spyOn(queryBus, "execute").mockResolvedValue(mockResponse)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/factories/${factoryContractId}/roles/${roleId}/members`)
        .query({ page: 1, pageSize: 5 })
        .expect(200)

      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(5)
    })

    it("should return empty array when no members found", async () => {
      const factoryContractId = "0.0.7247643"
      const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"

      const mockResponse: PageResponse<GetRoleMemberResponse> = {
        items: [],
        total: 0,
        page: 0,
        limit: 10,
        totalPages: 0,
      }

      jest.spyOn(queryBus, "execute").mockResolvedValue(mockResponse)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/factories/${factoryContractId}/roles/${roleId}/members`)
        .expect(200)

      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })
  })
})
