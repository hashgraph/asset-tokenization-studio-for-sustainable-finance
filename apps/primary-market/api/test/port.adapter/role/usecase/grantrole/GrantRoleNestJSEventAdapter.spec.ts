// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { UserPersistence } from "@port/persistence/user/model/UserPersistence"
import { RolePersistence } from "@port/persistence/role/model/RolePersistence"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { RoleGrantedDLTEvent } from "@port/role/usecase/grantrole/model/RoleGrantedDLTEvent"

describe("GrantRoleNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let userRepository: Repository<UserPersistence>
  let roleRepository: Repository<RolePersistence>
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
    await app.init()
    eventBus = app.get("EventBus")
    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
    userRepository = app.get(getRepositoryToken(UserPersistence))
    roleRepository = app.get(getRepositoryToken(RolePersistence))
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
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GrantRoleNestJSEventAdapter", () => {
    it("should grant role to a new user in a market", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const event = new RoleGrantedDLTEvent(
        "0.0.12345",
        "0xabc123",
        "0x1234567890123456789012345678901234567890",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      )
      await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0].accountId).toBe("0.0.4660")

      const roles = await roleRepository.find()
      expect(roles).toHaveLength(1)
      expect(roles[0].hex).toBe("0x0000000000000000000000000000000000000000000000000000000000000001")

      const userMarketRoles = await userMarketRoleRepository.find()
      expect(userMarketRoles).toHaveLength(1)
    })

    it("should throw error when granting same role twice", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const event = new RoleGrantedDLTEvent(
        "0.0.12345",
        "0xabc123",
        "0x1234567890123456789012345678901234567890",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      )

      await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

      await expect(eventBus.publishSync(event, RoleGrantedDLTEvent.name)).rejects.toThrow(
        "User 0.0.4660 already has role 0x0000000000000000000000000000000000000000000000000000000000000001 in market 0.0.12345",
      )
    })

    it("should grant different roles to the same user", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
      })

      const firstRoleEvent = new RoleGrantedDLTEvent(
        "0.0.12345",
        "0xabc123",
        "0x1234567890123456789012345678901234567890",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      )

      const secondRoleEvent = new RoleGrantedDLTEvent(
        "0.0.12345",
        "0xdef456",
        "0x1234567890123456789012345678901234567890",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
      )

      await eventBus.publishSync(firstRoleEvent, RoleGrantedDLTEvent.name)
      await eventBus.publishSync(secondRoleEvent, RoleGrantedDLTEvent.name)

      const users = await userRepository.find()
      expect(users).toHaveLength(1)

      const roles = await roleRepository.find()
      expect(roles).toHaveLength(2)

      const userMarketRoles = await userMarketRoleRepository.find()
      expect(userMarketRoles).toHaveLength(2)
    })

    it("should throw error when market does not exist", async () => {
      const event = new RoleGrantedDLTEvent(
        "0.0.99999",
        "0xabc123",
        "0x1234567890123456789012345678901234567890",
        "0x0000000000000000000000000000000000001234",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      )

      await expect(eventBus.publishSync(event, RoleGrantedDLTEvent.name)).rejects.toThrow()
    })
  })
})
