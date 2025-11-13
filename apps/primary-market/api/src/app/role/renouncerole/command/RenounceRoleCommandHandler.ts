// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { RenounceRoleCommand } from "./RenounceRoleCommand"
import { RenounceUserMarketRoleDomainService } from "@domain/usermarketrole/services/RenounceUserMarketRoleDomainService"
import { RoleRenouncedEvent } from "@domain/role/event/RoleRenouncedEvent"
import { RenounceUserMarketRoleDomainServiceRequest } from "@domain/usermarketrole/services/model/RenounceUserMarketRoleDomainServiceRequest"

@Singleton()
@Handler(RenounceRoleCommand)
export class RenounceRoleCommandHandler implements CommandHandler<RenounceRoleCommand, void> {
  constructor(
    private readonly renounceUserMarketRoleDomainService: RenounceUserMarketRoleDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: RenounceRoleCommand): Promise<void> {
    await this.renounceUserMarketRoleDomainService.execute(
      new RenounceUserMarketRoleDomainServiceRequest(command.accountId, command.roleHex, command.marketContractId),
    )
    this.eventBus.publish(new RoleRenouncedEvent(command.accountId, command.roleHex, command.marketContractId))
  }
}
