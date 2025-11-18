// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import {
  CommandBus,
  ConverterUtils,
  EventBus,
  RoleGrantedDLTEvent,
  SharedModule,
} from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("GrantRoleNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const ROLE_ID = "0x0000000000000000000000000000000000000000000000000000000000000001"
  const ACCOUNT_EVM = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
  const OPERATOR = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"

  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let commandBus: CommandBus

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
    commandBus = app.get("CommandBus")

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue("0.0.12345")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await app.close()
  })

  describe("GrantRoleNestJSEventAdapter", () => {
    it("should execute GrantRoleCommand when RoleGrantedDLTEvent is published", async () => {
      const commandExecuteSpy = jest.spyOn(commandBus, "execute").mockResolvedValue(undefined)

      const event = new RoleGrantedDLTEvent(CONTRACT_ID, "0xtxhash", OPERATOR, ACCOUNT_EVM, ROLE_ID)

      await eventBus.publishSync(event, RoleGrantedDLTEvent.name)

      expect(commandExecuteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: expect.any(String),
          roleId: ROLE_ID,
          contractId: CONTRACT_ID,
        }),
      )
    })

    it("should handle multiple role grants for different roles", async () => {
      const commandExecuteSpy = jest.spyOn(commandBus, "execute").mockResolvedValue(undefined)

      const role1 = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const role2 = "0x0000000000000000000000000000000000000000000000000000000000000002"

      const event1 = new RoleGrantedDLTEvent(CONTRACT_ID, "0xtxhash1", OPERATOR, ACCOUNT_EVM, role1)
      const event2 = new RoleGrantedDLTEvent(CONTRACT_ID, "0xtxhash2", OPERATOR, ACCOUNT_EVM, role2)

      await eventBus.publishSync(event1, RoleGrantedDLTEvent.name)
      await eventBus.publishSync(event2, RoleGrantedDLTEvent.name)

      expect(commandExecuteSpy).toHaveBeenCalledTimes(2)
      expect(commandExecuteSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          roleId: role1,
          contractId: CONTRACT_ID,
        }),
      )
      expect(commandExecuteSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          roleId: role2,
          contractId: CONTRACT_ID,
        }),
      )
    })

    it("should handle role grants for different users", async () => {
      const commandExecuteSpy = jest.spyOn(commandBus, "execute").mockResolvedValue(undefined)

      const account1 = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
      const account2 = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"

      const event1 = new RoleGrantedDLTEvent(CONTRACT_ID, "0xtxhash1", OPERATOR, account1, ROLE_ID)
      const event2 = new RoleGrantedDLTEvent(CONTRACT_ID, "0xtxhash2", OPERATOR, account2, ROLE_ID)

      await eventBus.publishSync(event1, RoleGrantedDLTEvent.name)
      await eventBus.publishSync(event2, RoleGrantedDLTEvent.name)

      expect(commandExecuteSpy).toHaveBeenCalledTimes(2)
    })
  })
})
