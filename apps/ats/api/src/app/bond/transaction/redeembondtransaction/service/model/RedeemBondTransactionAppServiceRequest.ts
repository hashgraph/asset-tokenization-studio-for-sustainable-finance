// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"

export class RedeemBondTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsOptional()
  partition?: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsString()
  @IsOptional()
  data?: string

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    partition: string | undefined,
    amount: string,
    data?: string,
  ) {
    super(format, accountId, bondContractId)
    this.partition = partition
    this.amount = amount
    this.data = data
  }
}
