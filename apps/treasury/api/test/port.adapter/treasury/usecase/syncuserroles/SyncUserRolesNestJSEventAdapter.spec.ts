// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import {
  ConverterUtils,
  EventBus,
  SharedModule,
  RolesAppliedDLTEvent,
  UserRolePersistence,
} from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { CqrsModule } from "@nestjs/cqrs"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("SyncUserRoles Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalUserRoleRepository: Repository<UserRolePersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, CqrsModule.forRoot(), PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalUserRoleRepository = app.get(getRepositoryToken(UserRolePersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalUserRoleRepository.deleteAll()
  })

  it("should apply grant and revoke", async () => {
    const contractId = "0.0.500"
    const evmAccount = "0xEvmAccountABC"
    const hederaAccountId = "0.0.100"
    const roleGrant = "0xroleGRANT"
    const roleRevoke = "0xroleREVOKE"

    await internalUserRoleRepository.save({
      userAccountId: hederaAccountId,
      roleId: roleRevoke,
      contractId,
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(hederaAccountId)

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => publishedEvents.push(event))

    const event = new RolesAppliedDLTEvent(contractId, "txHash1", [roleGrant, roleRevoke], [true, false], evmAccount)
    await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

    const savedRoles = await internalUserRoleRepository.find()
    expect(savedRoles).toHaveLength(1)
    expect(savedRoles[0]).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleGrant,
      contractId,
    })

    const revoked = await internalUserRoleRepository.findBy({ userAccountId: hederaAccountId, roleId: roleRevoke })
    expect(revoked).toHaveLength(0)

    expect(publishedEvents.length).toBe(2)
    const grantedEvent = publishedEvents.find((e) => e.constructor?.name === "RoleGrantedEvent")
    const revokedEvent = publishedEvents.find((e) => e.constructor?.name === "RoleRevokedEvent")
    expect(grantedEvent).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleGrant,
      contractId,
      timestamp: expect.any(Number),
    })
    expect(revokedEvent).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleRevoke,
      contractId,
      timestamp: expect.any(Number),
    })
  })

  it("should apply only grants when all actives true", async () => {
    const contractId = "0.0.600"
    const evmAccount = "0xEvmAccountOnlyGrant"
    const hederaAccountId = "0.0.200"
    const roleA = "0xroleA"
    const roleB = "0xroleB"

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(hederaAccountId)

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => publishedEvents.push(event))

    const event = new RolesAppliedDLTEvent(contractId, "txHash3", [roleA, roleB], [true, true], evmAccount)
    await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

    const savedRoles = await internalUserRoleRepository.find()
    expect(savedRoles).toHaveLength(2)
    expect(savedRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAccountId: hederaAccountId, roleId: roleA, contractId }),
        expect.objectContaining({ userAccountId: hederaAccountId, roleId: roleB, contractId }),
      ]),
    )

    expect(publishedEvents.length).toBe(2)
    const grantedA = publishedEvents.find((e) => e.constructor?.name === "RoleGrantedEvent" && e.roleId === roleA)
    const grantedB = publishedEvents.find((e) => e.constructor?.name === "RoleGrantedEvent" && e.roleId === roleB)
    expect(grantedA).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleA,
      contractId,
      timestamp: expect.any(Number),
    })
    expect(grantedB).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleB,
      contractId,
      timestamp: expect.any(Number),
    })
  })

  it("should apply only revokes when all actives false", async () => {
    const contractId = "0.0.700"
    const evmAccount = "0xEvmAccountOnlyRevoke"
    const hederaAccountId = "0.0.300"
    const roleA = "0xroleA"
    const roleB = "0xroleB"

    await internalUserRoleRepository.save({
      userAccountId: hederaAccountId,
      roleId: roleA,
      contractId,
    })
    await internalUserRoleRepository.save({
      userAccountId: hederaAccountId,
      roleId: roleB,
      contractId,
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(hederaAccountId)

    const publishedEvents: any[] = []
    jest.spyOn(eventBus, "publish").mockImplementation((event) => publishedEvents.push(event))

    const event = new RolesAppliedDLTEvent(contractId, "txHash4", [roleA, roleB], [false, false], evmAccount)
    await eventBus.publishSync(event, RolesAppliedDLTEvent.name)

    const remaining = await internalUserRoleRepository.findBy({ userAccountId: hederaAccountId })
    expect(remaining).toHaveLength(0)

    expect(publishedEvents.length).toBe(2)
    const revokedA = publishedEvents.find((e) => e.constructor?.name === "RoleRevokedEvent" && e.roleId === roleA)
    const revokedB = publishedEvents.find((e) => e.constructor?.name === "RoleRevokedEvent" && e.roleId === roleB)
    expect(revokedA).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleA,
      contractId,
      timestamp: expect.any(Number),
    })
    expect(revokedB).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleB,
      contractId,
      timestamp: expect.any(Number),
    })
  })
})
