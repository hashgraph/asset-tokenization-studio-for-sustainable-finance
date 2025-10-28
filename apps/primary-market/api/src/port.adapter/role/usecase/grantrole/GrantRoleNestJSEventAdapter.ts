// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RoleGrantedDLTEvent } from "./model/RoleGrantedDLTEvent"
import { GrantRolePort } from "./GrantRolePort"
import { GrantRoleCommand } from "@app/role/grantrole/command/GrantRoleCommand"

@Singleton()
export class GrantRoleNestJSEventAdapter implements GrantRolePort, EventListener<RoleGrantedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RoleGrantedDLTEvent)
  async handle(event: RoleGrantedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new GrantRoleCommand(await ConverterUtils.getHederaAddressFromEvm(event.account), event.role, event.contractId),
    )
  }
}
