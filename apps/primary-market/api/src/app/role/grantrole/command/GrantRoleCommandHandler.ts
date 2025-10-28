// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { GrantRoleCommand } from "./GrantRoleCommand"
import { GrantUserMarketRoleDomainService } from "@domain/usermarketrole/services/GrantUserMarketRoleDomainService"
import { RoleGrantedEvent } from "@domain/role/event/RoleGrantedEvent"

@Singleton()
@Handler(GrantRoleCommand)
export class GrantRoleCommandHandler implements CommandHandler<GrantRoleCommand, void> {
  constructor(
    private readonly grantUserMarketRoleDomainService: GrantUserMarketRoleDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: GrantRoleCommand): Promise<void> {
    const userMarketRole = await this.grantUserMarketRoleDomainService.execute(command)
    this.eventBus.publish(
      new RoleGrantedEvent(
        userMarketRole.id,
        userMarketRole.user.accountId,
        userMarketRole.role.hex,
        userMarketRole.market.contractId,
      ),
    )
  }
}
