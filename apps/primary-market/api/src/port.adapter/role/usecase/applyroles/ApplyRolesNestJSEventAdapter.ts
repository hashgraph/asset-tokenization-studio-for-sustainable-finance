// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import {
  ConverterUtils,
  EventListener,
  Handler,
  Inject,
  Singleton,
  RolesAppliedDLTEvent,
  GrantRoleCommand,
  RevokeRoleCommand,
} from "@hashgraph/green-bonds-shared-core"
import { ApplyRolesPort } from "./ApplyRolesPort"

@Singleton()
export class ApplyRolesNestJSEventAdapter implements ApplyRolesPort, EventListener<RolesAppliedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RolesAppliedDLTEvent)
  async handle(event: RolesAppliedDLTEvent): Promise<void> {
    const userAccountId = await ConverterUtils.getHederaAddressFromEvm(event.account)

    // Process each role with its corresponding active state
    for (let i = 0; i < event.roles.length; i++) {
      const role = event.roles[i]
      const isActive = event.actives[i]

      if (isActive) {
        await this.commandBus.execute(new GrantRoleCommand(userAccountId, role, event.contractId))
      } else {
        await this.commandBus.execute(new RevokeRoleCommand(userAccountId, role, event.contractId))
      }
    }
  }
}
