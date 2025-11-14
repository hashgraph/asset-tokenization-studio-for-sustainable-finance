// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class ReclaimClearingHoldCommand extends Command<void> {
  @IsNumber()
  clearingId: number

  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  operatorAccountId: string

  constructor(
    clearingId: number,
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    operatorAccountId: string,
  ) {
    super()
    this.clearingId = clearingId
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.operatorAccountId = operatorAccountId
  }
}
