// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RenounceRoleCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  accountId: string

  @IsNotEmpty()
  @IsString()
  roleHex: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  constructor(accountId: string, roleHex: string, marketContractId: string) {
    super()
    this.accountId = accountId
    this.roleHex = roleHex
    this.marketContractId = marketContractId
  }
}
