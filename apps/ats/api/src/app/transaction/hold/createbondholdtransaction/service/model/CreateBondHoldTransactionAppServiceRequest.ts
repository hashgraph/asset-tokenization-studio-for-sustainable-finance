// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsDateString } from "class-validator"

export class CreateBondHoldTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsOptional()
  partition?: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsDateString()
  @IsNotEmpty()
  expirationTimestamp: Date

  @IsString()
  @IsNotEmpty()
  escrowAccountId: string

  @IsString()
  @IsOptional()
  toAccountId?: string

  @IsString()
  @IsOptional()
  data?: string

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    partition: string | undefined,
    amount: string,
    expirationTimestamp: Date,
    escrowAccountId: string,
    toAccountId: string | undefined,
    data?: string,
  ) {
    super(format, accountId, bondContractId)
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.escrowAccountId = escrowAccountId
    this.toAccountId = toAccountId
    this.data = data
  }
}
