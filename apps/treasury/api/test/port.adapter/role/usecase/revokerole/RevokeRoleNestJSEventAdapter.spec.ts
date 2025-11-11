// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule, RoleRevokedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { RoleRevokedEvent } from "@domain/role/event/RoleRevokedEvent"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core/dist/port.adapter/persistence/userrole/model/UserRolePersistence"

describe("RevokeRole Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
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

  it("should revoke role: soft delete UserRole and publish RoleRevokedEvent", async () => {
    const treasuryContractId = "0.0.500"
    const evmAccount = "0xEvmAccountXYZ"
    const hederaAccountId = "0.0.100"
    const roleId = "0xroleABC"

    // Seed a user role to be revoked
    await internalUserRoleRepository.save({
      userAccountId: hederaAccountId,
      roleId: roleId,
      contractId: treasuryContractId,
    })

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(hederaAccountId)

    let publishedEvent: any
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new RoleRevokedDLTEvent(treasuryContractId, "txHash2", "0xOperator2", evmAccount, roleId)
    await eventBus.publishSync(event, RoleRevokedDLTEvent.name)

    const roles = await internalUserRoleRepository.find()
    expect(roles).toHaveLength(0)

    expect(publishedEvent?.constructor?.name).toEqual(RoleRevokedEvent.name)
    expect(publishedEvent).toEqual({
      accountId: hederaAccountId,
      roleId,
      treasuryContractId,
      timestamp: expect.any(Number),
    })
  })
})
