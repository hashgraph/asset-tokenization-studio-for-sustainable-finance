// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"

export class CreateClearingHoldCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsNumber()
  clearingId: number

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
  toAddress: string

  @IsNotEmpty()
  @IsString()
  escrowAddress: string

  @IsNotEmpty()
  @IsString()
  data: string

  @IsNotEmpty()
  @IsString()
  operatorData: string

  @IsNotEmpty()
  @IsString()
  operator: string

  constructor(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
    partition: string,
    amount: string,
    expirationDate: Date,
    toAddress: string,
    escrowAddress: string,
    data: string,
    operatorData: string,
    operator: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.clearingId = clearingId
    this.partition = partition
    this.amount = amount
    this.expirationDate = expirationDate
    this.toAddress = toAddress
    this.escrowAddress = escrowAddress
    this.data = data
    this.operatorData = operatorData
    this.operator = operator
  }
}
