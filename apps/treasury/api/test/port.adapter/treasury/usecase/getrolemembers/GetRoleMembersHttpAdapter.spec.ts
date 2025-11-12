// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core"

describe("GetRoleMembers API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalUserRoleRepository: Repository<UserRolePersistence>

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

    internalUserRoleRepository = moduleFixture.get<Repository<UserRolePersistence>>(
      getRepositoryToken(UserRolePersistence),
    )
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalUserRoleRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/roles/:roleId/roles", () => {
    it("should return empty list when no user roles exist", async () => {
      const treasuryContractId = "0.0.123456"
      const roleId = "1"
      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasuryContractId}/roles/${roleId}/members`)
        .expect(200)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it("should return user roles when they exist", async () => {
      const treasury1 = await internalUserRoleRepository.save({
        userAccountId: "1",
        roleId: "1",
        contractId: "0.0.123456",
      })

      const treasury2 = await internalUserRoleRepository.save({
        userAccountId: "2",
        roleId: "1",
        contractId: "0.0.123456",
      })

      const treasuryContractId = "0.0.123456"
      const roleId = "1"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasuryContractId}/roles/${roleId}/members`)
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      // Ordenar los items por roleId para hacer las validaciones determinísticas
      const sortedItems = response.body.items.sort((a: any, b: any) => a.userAccountId.localeCompare(b.userAccountId))

      expect(sortedItems[0]).toEqual({
        userAccountId: "1",
      })

      expect(sortedItems[1]).toEqual({
        userAccountId: "2",
      })
    })

    it("should handle pagination parameters", async () => {
      for (let i = 1; i <= 5; i++) {
        await internalUserRoleRepository.save({
          userAccountId: i,
          roleId: "1",
          contractId: "0.0.123456",
        })
      }

      const treasuryContractId = "0.0.123456"
      const roleId = "1"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasuryContractId}/roles/${roleId}/members`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should handle ordering parameters", async () => {
      const userRole1 = await internalUserRoleRepository.save({
        userAccountId: "1",
        roleId: "1",
        contractId: "0.0.123456",
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const userRole2 = await internalUserRoleRepository.save({
        userAccountId: "2",
        roleId: "1",
        contractId: "0.0.123456",
      })

      const treasuryContractId = "0.0.123456"
      const roleId = "1"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasuryContractId}/roles/${roleId}/members`)
        .query({ orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].userAccountId).toBe(userRole1.userAccountId)
      expect(response.body.items[1].userAccountId).toBe(userRole2.userAccountId)
    })
  })
})
