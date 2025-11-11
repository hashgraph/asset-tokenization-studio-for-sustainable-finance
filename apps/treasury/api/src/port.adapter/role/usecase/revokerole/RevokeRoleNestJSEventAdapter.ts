// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RoleRevokedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { RevokeRolePort } from "./RevokeRolePort"
import { RevokeRoleCommand } from "@app/role/revokerole/command/RevokeRoleCommand"

@Singleton()
export class RevokeRoleNestJSEventAdapter implements RevokeRolePort, EventListener<RoleRevokedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RoleRevokedDLTEvent)
  async handle(event: RoleRevokedDLTEvent): Promise<void> {
    const accountId = await ConverterUtils.getHederaAddressFromEvm(event.account)
    await this.commandBus.execute(new RevokeRoleCommand(accountId, event.role, event.contractId))
  }
}
