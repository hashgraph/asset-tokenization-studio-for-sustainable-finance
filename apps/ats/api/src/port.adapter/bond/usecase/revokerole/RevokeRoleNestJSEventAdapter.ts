// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RoleRevokedDLTEvent } from "@hashgraph/green-bonds-shared-core"
import { RevokeRolePort } from "./RevokeRolePort"
import { RevokeRoleCommand } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class RevokeRoleNestJSEventAdapter implements RevokeRolePort, EventListener<RoleRevokedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RoleRevokedDLTEvent)
  async handle(event: RoleRevokedDLTEvent): Promise<void> {
    const accountId = await ConverterUtils.getHederaAddressFromEvm(event.account)
    try {
      await this.commandBus.execute(new RevokeRoleCommand(accountId, event.role, event.contractId))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Intentionally suppressed - role revocation failures should not halt event processing
    }
  }
}
