// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator"

export class CreateClearingHoldTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsNumber()
  expirationTimestamp: number

  @IsNotEmpty()
  @IsString()
  escrowAddress: string

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
    expirationTimestamp: number,
    escrowAddress: string,
    data?: string,
  ) {
    super(format, accountId, bondContractId)
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.escrowAddress = escrowAddress
    this.data = data
  }
}
