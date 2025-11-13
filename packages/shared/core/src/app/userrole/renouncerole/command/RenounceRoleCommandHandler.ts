// SPDX-License-Identifier: Apache-2.0

import { Handler } from "@decorators/Handler"
import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { Validate } from "@decorators/Validate"
import type { CommandHandler } from "@command/CommandHandler"
import type { EventBus } from "@event/EventBus"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { RenounceRoleCommand } from "./RenounceRoleCommand"
import { CheckUserRoleExistsDomainService } from "@domain/userrole/services/CheckUserRoleExistsDomainService"
import { RoleRenouncedEvent } from "@domain/userrole/event/RoleRenouncedEvent"

@Singleton()
@Handler(RenounceRoleCommand)
export class RenounceRoleCommandHandler implements CommandHandler<RenounceRoleCommand, void> {
  constructor(
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly eventBus: EventBus,
    private readonly checkUserRoleExistsDomainService: CheckUserRoleExistsDomainService,
  ) {}

  @Validate()
  async execute(command: RenounceRoleCommand): Promise<void> {
    const userRole = await this.checkUserRoleExistsDomainService.execute(
      command.accountId,
      command.roleId,
      command.treasuryContractId,
    )
    await this.userRoleRepository.delete(userRole)

    this.eventBus.publish(new RoleRenouncedEvent(command.accountId, command.roleId, command.treasuryContractId))
  }
}
