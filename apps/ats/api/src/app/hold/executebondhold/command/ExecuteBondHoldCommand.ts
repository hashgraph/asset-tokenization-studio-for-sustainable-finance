// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class ExecuteBondHoldCommand extends Command<void> {
  @IsNumber()
  holdId: number

  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  constructor(
    bondContractId: string,
    holderAccountId: string,
    holdId: number,
    partition: string,
    amount: string,
    toAccountId: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.holdId = holdId
    this.partition = partition
    this.amount = amount
    this.toAccountId = toAccountId
  }
}
