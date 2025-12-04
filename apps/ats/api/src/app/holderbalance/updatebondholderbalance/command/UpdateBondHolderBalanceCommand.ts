// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class UpdateBondHolderBalanceCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  constructor(bondContractId: string, holderAccountId: string, partition: string, amount: string) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
  }
}
