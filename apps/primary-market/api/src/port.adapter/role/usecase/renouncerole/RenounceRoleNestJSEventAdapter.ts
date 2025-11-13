// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import {
  ConverterUtils,
  EventListener,
  Handler,
  Inject,
  RoleRenouncedDLTEvent,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { RenounceRolePort } from "./RenounceRolePort"
import { RenounceRoleCommand } from "@app/role/renouncerole/command/RenounceRoleCommand"

@Singleton()
export class RenounceRoleNestJSEventAdapter implements RenounceRolePort, EventListener<RoleRenouncedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RoleRenouncedDLTEvent)
  async handle(event: RoleRenouncedDLTEvent): Promise<void> {
    const accountId = await ConverterUtils.getHederaAddressFromEvm(event.account)
    await this.commandBus.execute(new RenounceRoleCommand(accountId, event.role, event.contractId))
  }
}
