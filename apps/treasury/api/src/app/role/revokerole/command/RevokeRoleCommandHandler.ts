// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import type { UserRoleRepository } from "@hashgraph/green-bonds-shared-core/dist/domain/userrole/repositories/UserRoleRepository"
import { RoleRevokedEvent } from "@domain/role/event/RoleRevokedEvent"
import { RevokeRoleCommand } from "./RevokeRoleCommand"

@Singleton()
@Handler(RevokeRoleCommand)
export class RevokeRoleCommandHandler implements CommandHandler<RevokeRoleCommand, void> {
  constructor(
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: RevokeRoleCommand): Promise<void> {
    const userRole = await this.userRoleRepository.findByUserAccountIdRoleIdAndContractId(
      command.accountId,
      command.roleId,
      command.treasuryContractId,
    )
    if (userRole) {
      await this.userRoleRepository.delete(userRole)
    }

    this.eventBus.publish(new RoleRevokedEvent(command.accountId, command.roleId, command.treasuryContractId))
  }
}
