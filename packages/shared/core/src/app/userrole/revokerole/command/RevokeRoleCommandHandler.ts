// SPDX-License-Identifier: Apache-2.0

import { Handler } from "@decorators/Handler"
import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { Validate } from "@decorators/Validate"
import type { CommandHandler } from "../../../../command/CommandHandler"
import type { EventBus } from "../../../../event/EventBus"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { RoleRevokedEvent } from "@domain/userrole/event/RoleRevokedEvent"
import { RevokeRoleCommand } from "./RevokeRoleCommand"
import { CheckUserRoleExistsDomainService } from "@domain/userrole/services/CheckUserRoleExistsDomainService"

@Singleton()
@Handler(RevokeRoleCommand)
export class RevokeRoleCommandHandler implements CommandHandler<RevokeRoleCommand, void> {
  constructor(
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly eventBus: EventBus,
    private readonly checkUserRoleExistsDomainService: CheckUserRoleExistsDomainService,
  ) {}

  @Validate()
  async execute(command: RevokeRoleCommand): Promise<void> {
    const userRole = await this.checkUserRoleExistsDomainService.execute(
      command.accountId,
      command.roleId,
      command.contractId,
    )
    await this.userRoleRepository.delete(userRole)

    this.eventBus.publish(new RoleRevokedEvent(command.accountId, command.roleId, command.contractId))
  }
}
