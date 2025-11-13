// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { SharedModule, UserRolePersistence } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("GetRoleMembers API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let userRoleRepository: Repository<UserRolePersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/")
    app.useLogger(false)
    await app.init()

    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
    userRoleRepository = app.get(getRepositoryToken(UserRolePersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("UserRole").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets/:marketContractId/roles/:roleHex/members", () => {
    it("should return empty list when role has no members", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const roleId = "0x9766707"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${roleId}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body.total).toBe(0)
      expect(response.body).toHaveProperty("page")
      expect(response.body.page).toBe(1)
      expect(response.body).toHaveProperty("limit")
      expect(response.body.limit).toBe(10)
      expect(response.body).toHaveProperty("totalPages")
      expect(response.body.totalPages).toBe(0)
    })

    it("should return all members for a role", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const roleId = "0x9766707"

      await userRoleRepository.save({
        userAccountId: "0.0.1111",
        roleId: roleId,
        contractId: market.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.2222",
        roleId: roleId,
        contractId: market.contractId,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${roleId}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const accountIds = response.body.items.map((item: any) => item.userAccountId)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
    })

    it("should handle pagination parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const roleId = "0x9766707"

      for (let i = 1; i <= 5; i++) {
        await userRoleRepository.save({
          userAccountId: `0.0.${1000 + i}`,
          roleId: roleId,
          contractId: market.contractId,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${roleId}/members`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should return second page of results", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const roleId = "0x9766707"

      for (let i = 1; i <= 5; i++) {
        await userRoleRepository.save({
          userAccountId: `0.0.${1000 + i}`,
          roleId: roleId,
          contractId: market.contractId,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${roleId}/members`)
        .query({ page: 2, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(2)
    })

    it("should return empty list when market does not exist", async () => {
      const roleId = "0x9766707"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/roles/${roleId}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })

    it("should return empty list when role does not exist", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/0x999999/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })

    it("should only return members for the specified role", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const roleId1 = "0x9766707"
      const roleId2 = "0x8765432"

      await userRoleRepository.save({
        userAccountId: "0.0.1111",
        roleId: roleId1,
        contractId: market.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.2222",
        roleId: roleId1,
        contractId: market.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.3333",
        roleId: roleId2,
        contractId: market.contractId,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${roleId1}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)

      const accountIds = response.body.items.map((item: any) => item.userAccountId)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
      expect(accountIds).not.toContain("0.0.3333")
    })

    it("should only return members for the specified market", async () => {
      const market1 = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.67890",
      })

      const roleId = "0x9766707"

      await userRoleRepository.save({
        userAccountId: "0.0.1111",
        roleId: roleId,
        contractId: market1.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.2222",
        roleId: roleId,
        contractId: market1.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.3333",
        roleId: roleId,
        contractId: market2.contractId,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market1.contractId}/roles/${roleId}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)

      const accountIds = response.body.items.map((item: any) => item.userAccountId)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
      expect(accountIds).not.toContain("0.0.3333")
    })

    it("should return unique users with the role", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const roleId = "0x9766707"

      await userRoleRepository.save({
        userAccountId: "0.0.1111",
        roleId: roleId,
        contractId: market.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.2222",
        roleId: roleId,
        contractId: market.contractId,
      })

      await userRoleRepository.save({
        userAccountId: "0.0.3333",
        roleId: roleId,
        contractId: market.contractId,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${roleId}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(3)
      expect(response.body.items).toHaveLength(3)

      const accountIds = response.body.items.map((item: any) => item.userAccountId)
      expect(new Set(accountIds).size).toBe(3)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
      expect(accountIds).toContain("0.0.3333")
    })
  })
})
