// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsNumberString } from "class-validator"

export class CreateClearingRedeemTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNumberString()
  @IsNotEmpty()
  expirationTimestamp: string

  @IsOptional()
  @IsString()
  data?: string

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    holderAccountId: string,
    partition: string | undefined,
    amount: string,
    expirationTimestamp: string,
    data?: string,
  ) {
    super(format, accountId, bondContractId)
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.data = data
  }
}
