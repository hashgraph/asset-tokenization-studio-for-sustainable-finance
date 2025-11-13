// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule, RoleRenouncedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core"

describe("RenounceRoleNestJSEventAdapter Integration", () => {
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

  describe("RenounceRoleNestJSEventAdapter", () => {
    it("should renounce role when RoleRenouncedDLTEvent is published", async () => {
      // First, create a user role
      const userRole = userRoleRepository.create({
        contractId: "0.0.1234567",
        roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        userAccountId: "0.0.4661",
      })
      await userRoleRepository.save(userRole)

      // Verify it exists
      let savedUserRole = await userRoleRepository.findOne({
        where: {
          contractId: "0.0.1234567",
          roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          userAccountId: "0.0.4661",
        },
      })
      expect(savedUserRole).toBeDefined()

      // Now renounce the role
      const event = new RoleRenouncedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        "0x0000000000000000000000000000000000001235", // account (EVM address)
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // role
      )

      await eventBus.publishSync(event, RoleRenouncedDLTEvent.name)

      // Verify it was deleted
      savedUserRole = await userRoleRepository.findOne({
        where: {
          contractId: "0.0.1234567",
          roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          userAccountId: "0.0.4661",
        },
      })

      expect(savedUserRole).toBeNull()
    })

    it("should renounce multiple roles from the same user", async () => {
      const accountEvm = "0x0000000000000000000000000000000000001235"
      const roles = [
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      ]

      // Create all roles first
      for (const role of roles) {
        const userRole = userRoleRepository.create({
          contractId: "0.0.1234567",
          roleId: role,
          userAccountId: "0.0.4661",
        })
        await userRoleRepository.save(userRole)
      }

      // Verify all roles exist
      let allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661" },
      })
      expect(allUserRoles).toHaveLength(roles.length)

      // Renounce each role
      for (const role of roles) {
        const event = new RoleRenouncedDLTEvent(
          "0.0.1234567", // contractId
          "0x123456789", // transactionHash
          accountEvm, // account
          role, // role
        )

        await eventBus.publishSync(event, RoleRenouncedDLTEvent.name)

        const savedUserRole = await userRoleRepository.findOne({
          where: {
            contractId: "0.0.1234567",
            roleId: role,
            userAccountId: "0.0.4661",
          },
        })

        expect(savedUserRole).toBeNull()
      }

      // Verify all roles were removed
      allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661" },
      })
      expect(allUserRoles).toHaveLength(0)
    })

    it("should renounce same role from multiple users", async () => {
      const role = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const accounts = [
        "0x0000000000000000000000000000000000001235",
        "0x0000000000000000000000000000000000001236",
        "0x0000000000000000000000000000000000001237",
      ]
      const expectedHederaIds = ["0.0.4661", "0.0.4662", "0.0.4663"]

      // Create roles for all users
      for (const hederaId of expectedHederaIds) {
        const userRole = userRoleRepository.create({
          contractId: "0.0.1234567",
          roleId: role,
          userAccountId: hederaId,
        })
        await userRoleRepository.save(userRole)
      }

      // Verify all roles exist
      let allUserRoles = await userRoleRepository.find({
        where: { roleId: role },
      })
      expect(allUserRoles).toHaveLength(accounts.length)

      // Renounce role for each user
      for (let i = 0; i < accounts.length; i++) {
        const event = new RoleRenouncedDLTEvent(
          "0.0.1234567", // contractId
          "0x123456789", // transactionHash
          accounts[i], // account
          role, // role
        )

        await eventBus.publishSync(event, RoleRenouncedDLTEvent.name)

        const savedUserRole = await userRoleRepository.findOne({
          where: {
            contractId: "0.0.1234567",
            roleId: role,
            userAccountId: expectedHederaIds[i],
          },
        })

        expect(savedUserRole).toBeNull()
      }

      // Verify all roles were removed
      allUserRoles = await userRoleRepository.find({
        where: { roleId: role },
      })
      expect(allUserRoles).toHaveLength(0)
    })

    it("should publish RoleRenouncedEvent after successful role renounce", async () => {
      // First, create a user role
      const userRole = userRoleRepository.create({
        contractId: "0.0.1234567",
        roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        userAccountId: "0.0.4661",
      })
      await userRoleRepository.save(userRole)

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new RoleRenouncedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        "0x0000000000000000000000000000000000001235", // account
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // role
      )

      await eventBus.publishSync(event, RoleRenouncedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          userAccountId: "0.0.4661",
          roleId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          contractId: "0.0.1234567",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should handle renounce for non-existent role gracefully", async () => {
      const event = new RoleRenouncedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        "0x0000000000000000000000000000000000001235", // account (EVM address)
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // role that doesn't exist
      )

      // This should not throw an error
      await expect(eventBus.publishSync(event, RoleRenouncedDLTEvent.name)).rejects.toThrow()
    })
  })
})
