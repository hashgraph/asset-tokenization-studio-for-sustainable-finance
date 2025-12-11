// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { PageResponse, QueryBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { GetUserRoleResponse } from "@port/bond/usecase/getuserroles/model/GetUserRoleResponse"

describe("GetUserRoles API Integration", () => {
  let app: INestApplication
  let queryBus: QueryBus
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()

    queryBus = app.get("QueryBus")
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /bonds/:bondContractId/users/:userAccountId/roles", () => {
    it("should return user roles with pagination", async () => {
      const bondContractId = "0.0.67890"
      const userAccountId = "0.0.12345"

      const mockResponse: PageResponse<GetUserRoleResponse> = {
        items: [
          { roleId: "0x0000000000000000000000000000000000000000000000000000000000000001" },
          { roleId: "0x0000000000000000000000000000000000000000000000000000000000000002" },
        ],
        total: 2,
        page: 0,
        limit: 10,
        totalPages: 1,
      }

      jest.spyOn(queryBus, "execute").mockResolvedValue(mockResponse)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/users/${userAccountId}/roles`)
        .expect(200)

      expect(response.body).toEqual(mockResponse)
      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0]).toHaveProperty("roleId")
    })

    it("should handle pagination parameters", async () => {
      const bondContractId = "0.0.67890"
      const userAccountId = "0.0.12345"

      const mockResponse: PageResponse<GetUserRoleResponse> = {
        items: [{ roleId: "0x0000000000000000000000000000000000000000000000000000000000000001" }],
        total: 10,
        page: 1,
        limit: 5,
        totalPages: 2,
      }

      jest.spyOn(queryBus, "execute").mockResolvedValue(mockResponse)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/users/${userAccountId}/roles`)
        .query({ page: 1, pageSize: 5 })
        .expect(200)

      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(5)
    })

    it("should return empty array when no roles found", async () => {
      const bondContractId = "0.0.67890"
      const userAccountId = "0.0.12345"

      const mockResponse: PageResponse<GetUserRoleResponse> = {
        items: [],
        total: 0,
        page: 0,
        limit: 10,
        totalPages: 0,
      }

      jest.spyOn(queryBus, "execute").mockResolvedValue(mockResponse)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/users/${userAccountId}/roles`)
        .expect(200)

      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })
  })
})
