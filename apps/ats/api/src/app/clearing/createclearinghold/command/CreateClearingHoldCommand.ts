// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateClearingHoldCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumber()
  clearingId: number

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsString()
  partition: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsDate()
  expirationDate: Date

  @IsNotEmpty()
  @IsString()
  toAccountId: string

  @IsNotEmpty()
  @IsString()
  escrowAccountId: string

  @IsNotEmpty()
  @IsString()
  data: string

  @IsNotEmpty()
  @IsString()
  operatorData: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  constructor(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
    partition: string,
    amount: string,
    expirationDate: Date,
    toAccountId: string,
    escrowAccountId: string,
    data: string,
    operatorData: string,
    operatorAccountId: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.clearingId = clearingId
    this.partition = partition
    this.amount = amount
    this.expirationDate = expirationDate
    this.toAccountId = toAccountId
    this.escrowAccountId = escrowAccountId
    this.data = data
    this.operatorData = operatorData
    this.operatorAccountId = operatorAccountId
  }
}
