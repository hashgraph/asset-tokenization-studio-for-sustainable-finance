// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule, RoleGrantedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { CqrsModule } from "@nestjs/cqrs"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { GrantRoleCommandHandler } from "@hashgraph/green-bonds-shared-core"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core/dist/port.adapter/persistence/userrole/model/UserRolePersistence"

describe("GrantRole Integration", () => {
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
      providers: [...PROVIDERS, GrantRoleCommandHandler],
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

  it("should grant role: persist UserRole and publish RoleGrantedEvent", async () => {
    const treasuryContractId = "0.0.500"
    const evmAccount = "0xEvmAccountABC"
    const hederaAccountId = "0.0.100"
    const roleId = "0xroleABC"

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(hederaAccountId)

    let publishedEvent: any
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new RoleGrantedDLTEvent(treasuryContractId, "txHash1", "0xOperator", evmAccount, roleId)
    await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

    const savedRoles = await internalUserRoleRepository.find()
    expect(savedRoles).toHaveLength(1)
    expect(savedRoles[0]).toMatchObject({
      userAccountId: hederaAccountId,
      roleId: roleId,
      contractId: treasuryContractId,
    })

    expect(publishedEvent?.constructor?.name).toEqual("RoleGrantedEvent")
    expect(publishedEvent).toEqual({
      userAccountId: hederaAccountId,
      roleId,
      contractId: treasuryContractId,
      timestamp: expect.any(Number),
    })
  })
})
