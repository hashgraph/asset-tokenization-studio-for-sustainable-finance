// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"

export class BuildReleaseBondLockTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsNumberString()
  @IsNotEmpty()
  lockId: string

  @IsString()
  @IsOptional()
  partition?: string

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    holderAccountId: string,
    lockId: string,
    partition?: string,
  ) {
    super(format, accountId, bondContractId)
    this.holderAccountId = holderAccountId
    this.lockId = lockId
    this.partition = partition
  }
}
