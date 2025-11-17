// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"

export class BuildTransferByPartitionTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsOptional()
  partition?: string

  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsString()
  @IsOptional()
  data?: string
}
