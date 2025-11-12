// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator"

export class CancelClearingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsNumber()
  clearingId: number

  @IsNotEmpty()
  @IsNumber()
  readonly operationType: number = 2 // Always HOLD type

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    holderAccountId: string,
    partition: string | undefined,
    clearingId: number,
  ) {
    super(format, accountId, bondContractId)
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.clearingId = clearingId
  }
}
