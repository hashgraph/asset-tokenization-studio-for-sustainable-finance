// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString, IsOptional } from "class-validator"
import { Type } from "class-transformer"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateBondHoldCommand extends Command<void> {
  @IsNumber()
  holdId: number

  @IsString()
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

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  expirationTimestamp: Date

  @IsString()
  @IsNotEmpty()
  escrowAccountId: string

  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @IsString()
  @IsOptional()
  data: string

  @IsString()
  @IsOptional()
  operatorData: string

  @IsString()
  @IsNotEmpty()
  operatorAccountId: string

  constructor(
    holdId: number,
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    expirationTimestamp: Date,
    escrowAccountId: string,
    toAccountId: string,
    data: string,
    operatorData: string,
    operatorAccountId: string,
  ) {
    super()
    this.holdId = holdId
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.escrowAccountId = escrowAccountId
    this.toAccountId = toAccountId
    this.data = data
    this.operatorData = operatorData
    this.operatorAccountId = operatorAccountId
  }
}
