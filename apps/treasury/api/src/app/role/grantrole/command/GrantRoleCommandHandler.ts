// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { GrantRoleCommand } from "./GrantRoleCommand"
import type { UserRoleRepository } from "@hashgraph/green-bonds-shared-core/dist/domain/userrole/repositories/UserRoleRepository"
import { RoleGrantedEvent } from "@domain/role/event/RoleGrantedEvent"
import { UserRole } from "@hashgraph/green-bonds-shared-core/dist/domain/userrole/model/UserRole"

@Singleton()
@Handler(GrantRoleCommand)
export class GrantRoleCommandHandler implements CommandHandler<GrantRoleCommand, void> {
  constructor(
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: GrantRoleCommand): Promise<void> {
    const userRole = Object.assign(new UserRole(), {
      userAccountId: command.accountId,
      roleId: command.roleId,
      contractId: command.treasuryContractId,
    })

    await this.userRoleRepository.save(userRole)

    this.eventBus.publish(new RoleGrantedEvent(command.accountId, command.roleId, command.treasuryContractId))
  }
}
