// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class TransferByPartitionCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  fromAccountId: string

  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsString()
  @IsNotEmpty()
  operatorAccountId: string

  constructor(
    bondContractId: string,
    partition: string,
    fromAccountId: string,
    toAccountId: string,
    amount: string,
    operatorAccountId: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.partition = partition
    this.fromAccountId = fromAccountId
    this.toAccountId = toAccountId
    this.amount = amount
    this.operatorAccountId = operatorAccountId
  }
}
