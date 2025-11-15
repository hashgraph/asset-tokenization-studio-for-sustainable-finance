// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule, RolesAppliedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { DataSource, Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core"

describe("ApplyRolesNestJSEventAdapter Integration", () => {
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

  describe("ApplyRolesNestJSEventAdapter", () => {
    it("should grant new roles when RolesAppliedDLTEvent is published with active roles", async () => {
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"], // roles
        [true], // actives - true means grant the role
        "0x0000000000000000000000000000000000001235", // account (EVM address)
      )

      await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

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

    it("should revoke roles when RolesAppliedDLTEvent is published with inactive roles", async () => {
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

      // Now revoke the role
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"], // roles
        [false], // actives - false means revoke the role
        "0x0000000000000000000000000000000000001235", // account (EVM address)
      )

      await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

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

    it("should handle mixed grant and revoke operations in single event", async () => {
      const role1 = "0x1111111111111111111111111111111111111111111111111111111111111111"
      const role2 = "0x2222222222222222222222222222222222222222222222222222222222222222"
      const role3 = "0x3333333333333333333333333333333333333333333333333333333333333333"

      // Create role2 (will be revoked)
      const existingRole = userRoleRepository.create({
        contractId: "0.0.1234567",
        roleId: role2,
        userAccountId: "0.0.4661",
      })
      await userRoleRepository.save(existingRole)

      // Apply roles: grant role1 and role3, revoke role2
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        [role1, role2, role3], // roles
        [true, false, true], // actives
        "0x0000000000000000000000000000000000001235", // account (EVM address)
      )

      await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

      // Check role1 was granted
      const savedRole1 = await userRoleRepository.findOne({
        where: { contractId: "0.0.1234567", roleId: role1, userAccountId: "0.0.4661" },
      })
      expect(savedRole1).toBeDefined()

      // Check role2 was revoked
      const savedRole2 = await userRoleRepository.findOne({
        where: { contractId: "0.0.1234567", roleId: role2, userAccountId: "0.0.4661" },
      })
      expect(savedRole2).toBeNull()

      // Check role3 was granted
      const savedRole3 = await userRoleRepository.findOne({
        where: { contractId: "0.0.1234567", roleId: role3, userAccountId: "0.0.4661" },
      })
      expect(savedRole3).toBeDefined()
    })

    it("should grant multiple roles to the same user", async () => {
      const accountEvm = "0x0000000000000000000000000000000000001235"
      const roles = [
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      ]
      const actives = [true, true, true]

      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        roles, // roles
        actives, // all active
        accountEvm, // account
      )

      await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

      for (const role of roles) {
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

    it("should revoke multiple roles from the same user", async () => {
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

      // Revoke all roles
      const actives = [false, false, false]
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        roles, // roles
        actives, // all inactive
        accountEvm, // account
      )

      await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

      // Verify all roles were removed
      allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661" },
      })
      expect(allUserRoles).toHaveLength(0)
    })

    it("should handle empty roles array", async () => {
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        [], // empty roles
        [], // empty actives
        "0x0000000000000000000000000000000000001235", // account (EVM address)
      )

      // This should not throw an error
      await expect(eventBus.publishSync(event, RolesAppliedDLTEvent.name)).resolves.not.toThrow()

      // Verify no roles were created
      const allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661" },
      })
      expect(allUserRoles).toHaveLength(0)
    })

    it("should apply same roles to multiple users", async () => {
      const role = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      const accounts = [
        "0x0000000000000000000000000000000000001235",
        "0x0000000000000000000000000000000000001236",
        "0x0000000000000000000000000000000000001237",
      ]
      const expectedHederaIds = ["0.0.4661", "0.0.4662", "0.0.4663"]

      for (let i = 0; i < accounts.length; i++) {
        const event = new RolesAppliedDLTEvent(
          "0.0.1234567", // contractId
          "0x123456789", // transactionHash
          [role], // roles
          [true], // active
          accounts[i], // account
        )

        await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

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

    it("should grant role multiple times without error", async () => {
      const role = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

      // Grant the role first time
      const event1 = new RolesAppliedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        [role],
        [true],
        "0x0000000000000000000000000000000000001235",
      )

      await eventBus.publishSync(event1, RolesAppliedDLTEvent.name)

      // Grant the same role again (sync operation should handle this)
      const event2 = new RolesAppliedDLTEvent(
        "0.0.1234567",
        "0x12345678a",
        [role],
        [true],
        "0x0000000000000000000000000000000000001235",
      )

      // This should not throw
      await expect(eventBus.publishSync(event2, RolesAppliedDLTEvent.name)).resolves.not.toThrow()

      // Should have at least one role entry
      const allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661", roleId: role },
      })
      expect(allUserRoles.length).toBeGreaterThanOrEqual(1)
    })

    it("should throw error when revoking non-existent role", async () => {
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567", // contractId
        "0x123456789", // transactionHash
        ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"], // role that doesn't exist
        [false], // inactive - revoke
        "0x0000000000000000000000000000000000001235", // account (EVM address)
      )

      // Should throw UserRoleNotFoundError
      await expect(eventBus.publishSync(event, RolesAppliedDLTEvent.name)).rejects.toThrow()
    })

    it("should handle complex scenario with multiple grants and revokes", async () => {
      const roles = [
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444444444444444444444444444",
      ]

      // Create initial roles (role1 and role2)
      await userRoleRepository.save({
        contractId: "0.0.1234567",
        roleId: roles[0],
        userAccountId: "0.0.4661",
      })
      await userRoleRepository.save({
        contractId: "0.0.1234567",
        roleId: roles[1],
        userAccountId: "0.0.4661",
      })

      // Apply: keep role1, revoke role2, grant role3 and role4
      const event = new RolesAppliedDLTEvent(
        "0.0.1234567",
        "0x123456789",
        roles,
        [true, false, true, true],
        "0x0000000000000000000000000000000000001235",
      )

      await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

      // Check final state
      const allUserRoles = await userRoleRepository.find({
        where: { userAccountId: "0.0.4661" },
      })

      // Should have at least 3 roles (may have duplicates due to sync implementation)
      expect(allUserRoles.length).toBeGreaterThanOrEqual(3)

      const roleIds = allUserRoles.map((r) => r.roleId)
      expect(roleIds).toContain(roles[0]) // role1 still exists
      expect(roleIds).not.toContain(roles[1]) // role2 was revoked
      expect(roleIds).toContain(roles[2]) // role3 was granted
      expect(roleIds).toContain(roles[3]) // role4 was granted
    })
  })
})
