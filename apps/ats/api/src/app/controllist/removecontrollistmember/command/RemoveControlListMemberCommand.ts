// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RemoveControlListMemberCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  constructor(bondContractId: string, holderAccountId: string) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
  }
}
