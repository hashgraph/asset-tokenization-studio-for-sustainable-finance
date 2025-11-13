// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { Validate } from "@decorators/Validate"
import { SyncUserRolesAppServiceRequest } from "./model/SyncUserRolesAppServiceRequest"
import { CommandBus } from "@nestjs/cqrs"
import { GrantRoleCommand } from "src/app/userrole/grantrole/command/GrantRoleCommand"
import { RevokeRoleCommand } from "src/app/userrole/revokerole/command/RevokeRoleCommand"

@Singleton()
export class SyncUserRolesAppService {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Validate()
  async execute(request: SyncUserRolesAppServiceRequest): Promise<void> {
    for (let i = 0; i < request.roles.length; i++) {
      const role = request.roles[i]
      const active = request.actives[i]
      if (active) {
        await this.commandBus.execute(new GrantRoleCommand(request.accountId, role, request.treasuryContractId))
      } else {
        await this.commandBus.execute(new RevokeRoleCommand(request.accountId, role, request.treasuryContractId))
      }
    }
  }
}
