// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"
import { Type } from "class-transformer"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateBondLockCommand extends Command<void> {
  @IsNumber()
  lockId: number

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
  operatorAccountId: string

  constructor(
    lockId: number,
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    expirationTimestamp: Date,
    operatorAccountId: string,
  ) {
    super()
    this.lockId = lockId
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.operatorAccountId = operatorAccountId
  }
}
