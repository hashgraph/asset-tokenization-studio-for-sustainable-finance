// SPDX-License-Identifier: Apache-2.0
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import {
  ConverterUtils,
  EventListener,
  Handler,
  Inject,
  RoleGrantedDLTEvent,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"

import { GrantRolePort } from "./GrantRolePort"
import { GrantRoleCommand } from "@app/role/grantrole/command/GrantRoleCommand"

@Singleton()
export class GrantRoleNestJSEventAdapter implements GrantRolePort, EventListener<RoleGrantedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RoleGrantedDLTEvent)
  async handle(event: RoleGrantedDLTEvent): Promise<void> {
    const accountId = await ConverterUtils.getHederaAddressFromEvm(event.account)
    await this.commandBus.execute(new GrantRoleCommand(accountId, event.role, event.contractId))
  }
}
