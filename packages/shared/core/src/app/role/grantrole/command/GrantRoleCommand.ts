// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "../../../../command/Command"

export class GrantRoleCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  accountId: string

  @IsNotEmpty()
  @IsString()
  roleId: string

  @IsNotEmpty()
  @IsString()
  treasuryContractId: string

  constructor(accountId: string, roleId: string, treasuryContractId: string) {
    super()
    this.accountId = accountId
    this.roleId = roleId
    this.treasuryContractId = treasuryContractId
  }
}
