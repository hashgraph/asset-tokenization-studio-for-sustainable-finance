// SPDX-License-Identifier: Apache-2.0

import { Handler } from "@decorators/Handler"
import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { Validate } from "@decorators/Validate"
import type { CommandHandler } from "../../../../command/CommandHandler"
import type { EventBus } from "../../../../event/EventBus"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { UserRole } from "@domain/userrole/model/UserRole"
import { RoleGrantedEvent } from "@domain/userrole/event/RoleGrantedEvent"
import { GrantRoleCommand } from "./GrantRoleCommand"

@Singleton()
@Handler(GrantRoleCommand)
export class GrantRoleCommandHandler implements CommandHandler<GrantRoleCommand, void> {
  constructor(
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: GrantRoleCommand): Promise<void> {
    const userRole = new UserRole()
    userRole.userAccountId = command.accountId
    userRole.roleId = command.roleId
    userRole.contractId = command.treasuryContractId

    await this.userRoleRepository.save(userRole)

    this.eventBus.publish(new RoleGrantedEvent(command.accountId, command.roleId, command.treasuryContractId))
  }
}
