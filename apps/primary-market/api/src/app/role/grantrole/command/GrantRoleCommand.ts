// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class GrantRoleCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  accountId: string

  @IsNotEmpty()
  @IsString()
  roleHex: string

  @IsNotEmpty()
  @IsString()
  marketId: string

  constructor(accountId: string, roleHex: string, marketId: string) {
    super()
    this.accountId = accountId
    this.roleHex = roleHex
    this.marketId = marketId
  }
}
