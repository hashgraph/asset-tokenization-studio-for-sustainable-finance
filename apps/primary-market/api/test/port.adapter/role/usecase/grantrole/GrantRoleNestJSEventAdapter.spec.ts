// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule, RoleGrantedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core"

describe("GrantRoleNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
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
    await app.init()
    eventBus = app.get("EventBus")
    userRoleRepository = app.get(getRepositoryToken(UserRolePersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("UserRole").execute()
    await app.close()
  })

  describe("GrantRoleNestJSEventAdapter", () => {
    it("should grant role when RoleGrantedDLTEvent is published", async () => {
      const event = new RoleGrantedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        "0x0000000000000000000000000000000000001234", // operator (EVM address)
        "0x0000000000000000000000000000000000001235", // account (EVM address)
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // role
      )

      await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

      const savedUserRole = await userRoleRepository.findOne({
        where: {
          contractId: "0.0.1234567",
          roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          userAccountId: "0.0.4661", // Converted from EVM address
        },
      })

      expect(savedUserRole).toBeDefined()
      expect(savedUserRole).not.toBeNull()
      expect(savedUserRole!.contractId).toBe("0.0.1234567")
      expect(savedUserRole!.roleId).toBe("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
      expect(savedUserRole!.userAccountId).toBe("0.0.4661")
    })

    it("should grant multiple roles to the same user", async () => {
      const accountEvm = "0x0000000000000000000000000000000000001235"
      const roles = [
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      ]

      for (const role of roles) {
        const event = new RoleGrantedDLTEvent(
          "0.0.1234567", // contractId
          "0x123456789", // transactionHash
          "0x0000000000000000000000000000000000001234", // operator
          accountEvm, // account
          role, // role
        )

        await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

        const savedUserRole = await userRoleRepository.findOne({
          where: {
            contractId: "0.0.1234567",
            roleId: role,
            userAccountId: "0.0.4661",
          },
        })

        expect(savedUserRole).toBeDefined()
        expect(savedUserRole).not.toBeNull()
        expect(savedUserRole!.roleId).toBe(role)
      }

      const allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661" },
      })
      expect(allUserRoles).toHaveLength(roles.length)
    })

    it("should grant same role to multiple users", async () => {
      const role = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const accounts = [
        "0x0000000000000000000000000000000000001235",
        "0x0000000000000000000000000000000000001236",
        "0x0000000000000000000000000000000000001237",
      ]
      const expectedHederaIds = ["0.0.4661", "0.0.4662", "0.0.4663"]

      for (let i = 0; i < accounts.length; i++) {
        const event = new RoleGrantedDLTEvent(
          "0.0.1234567", // contractId
          "0x123456789", // transactionHash
          "0x0000000000000000000000000000000000001234", // operator
          accounts[i], // account
          role, // role
        )

        await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

        const savedUserRole = await userRoleRepository.findOne({
          where: {
            contractId: "0.0.1234567",
            roleId: role,
            userAccountId: expectedHederaIds[i],
          },
        })

        expect(savedUserRole).toBeDefined()
        expect(savedUserRole).not.toBeNull()
        expect(savedUserRole!.userAccountId).toBe(expectedHederaIds[i])
      }

      const allUserRoles = await userRoleRepository.find({
        where: { roleId: role },
      })
      expect(allUserRoles).toHaveLength(accounts.length)
    })

    it("should publish RoleGrantedEvent after successful role grant", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new RoleGrantedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        "0x0000000000000000000000000000000000001234", // operator
        "0x0000000000000000000000000000000000001235", // account
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // role
      )

      await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          accountId: "0.0.4661",
          roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          contractId: "0.0.1234567",
          timestamp: expect.any(Number),
        }),
      )
    })
  })
})
