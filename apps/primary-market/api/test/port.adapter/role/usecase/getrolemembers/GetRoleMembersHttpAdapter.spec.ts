// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { RolePersistence } from "@port/persistence/role/model/RolePersistence"
import { UserPersistence } from "@port/persistence/user/model/UserPersistence"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("GetRoleMembers API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let roleRepository: Repository<RolePersistence>
  let userRepository: Repository<UserPersistence>
  let userMarketRoleRepository: Repository<UserMarketRolePersistence>

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
    roleRepository = app.get(getRepositoryToken(RolePersistence))
    userRepository = app.get(getRepositoryToken(UserPersistence))
    userMarketRoleRepository = app.get(getRepositoryToken(UserMarketRolePersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("UserMarketRole").execute()
    await dataSource.createQueryBuilder().delete().from("User").execute()
    await dataSource.createQueryBuilder().delete().from("Role").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets/:marketContractId/roles/:roleHex/members", () => {
    it("should return empty list when role has no members", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${role.hex}/members`)
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

      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      const user1 = await userRepository.save({
        accountId: "0.0.1111",
      })

      const user2 = await userRepository.save({
        accountId: "0.0.2222",
      })

      await userMarketRoleRepository.save({
        user: user1,
        role: role,
        market: market,
      })

      await userMarketRoleRepository.save({
        user: user2,
        role: role,
        market: market,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${role.hex}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const accountIds = response.body.items.map((item: any) => item.accountId)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
    })

    it("should handle pagination parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      for (let i = 1; i <= 5; i++) {
        const user = await userRepository.save({
          accountId: `0.0.${1000 + i}`,
        })

        await userMarketRoleRepository.save({
          user: user,
          role: role,
          market: market,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${role.hex}/members`)
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

      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      for (let i = 1; i <= 5; i++) {
        const user = await userRepository.save({
          accountId: `0.0.${1000 + i}`,
        })

        await userMarketRoleRepository.save({
          user: user,
          role: role,
          market: market,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${role.hex}/members`)
        .query({ page: 2, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(2)
    })

    it("should return 404 when market does not exist", async () => {
      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/roles/${role.hex}/members`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should return 404 when role does not exist", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/0x999999/members`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should only return members for the specified role", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const role1 = await roleRepository.save({
        hex: "0x9766707",
      })

      const role2 = await roleRepository.save({
        hex: "0x8765432",
      })

      const user1 = await userRepository.save({
        accountId: "0.0.1111",
      })

      const user2 = await userRepository.save({
        accountId: "0.0.2222",
      })

      const user3 = await userRepository.save({
        accountId: "0.0.3333",
      })

      await userMarketRoleRepository.save({
        user: user1,
        role: role1,
        market: market,
      })

      await userMarketRoleRepository.save({
        user: user2,
        role: role1,
        market: market,
      })

      await userMarketRoleRepository.save({
        user: user3,
        role: role2,
        market: market,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${role1.hex}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)

      const accountIds = response.body.items.map((item: any) => item.accountId)
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

      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      const user1 = await userRepository.save({
        accountId: "0.0.1111",
      })

      const user2 = await userRepository.save({
        accountId: "0.0.2222",
      })

      const user3 = await userRepository.save({
        accountId: "0.0.3333",
      })

      await userMarketRoleRepository.save({
        user: user1,
        role: role,
        market: market1,
      })

      await userMarketRoleRepository.save({
        user: user2,
        role: role,
        market: market1,
      })

      await userMarketRoleRepository.save({
        user: user3,
        role: role,
        market: market2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market1.contractId}/roles/${role.hex}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)

      const accountIds = response.body.items.map((item: any) => item.accountId)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
      expect(accountIds).not.toContain("0.0.3333")
    })

    it("should return unique users with the role", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const role = await roleRepository.save({
        hex: "0x9766707",
      })

      const user1 = await userRepository.save({
        accountId: "0.0.1111",
      })

      const user2 = await userRepository.save({
        accountId: "0.0.2222",
      })

      const user3 = await userRepository.save({
        accountId: "0.0.3333",
      })

      await userMarketRoleRepository.save({
        user: user1,
        role: role,
        market: market,
      })

      await userMarketRoleRepository.save({
        user: user2,
        role: role,
        market: market,
      })

      await userMarketRoleRepository.save({
        user: user3,
        role: role,
        market: market,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/${market.contractId}/roles/${role.hex}/members`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(3)
      expect(response.body.items).toHaveLength(3)

      const accountIds = response.body.items.map((item: any) => item.accountId)
      expect(new Set(accountIds).size).toBe(3)
      expect(accountIds).toContain("0.0.1111")
      expect(accountIds).toContain("0.0.2222")
      expect(accountIds).toContain("0.0.3333")
    })
  })
})
