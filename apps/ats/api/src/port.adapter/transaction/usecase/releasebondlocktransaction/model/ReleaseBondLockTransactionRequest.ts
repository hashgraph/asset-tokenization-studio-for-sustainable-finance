// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, IsNotEmpty, IsString, IsOptional } from "class-validator"

export class ReleaseBondLockTransactionRequest extends BaseTransactionRequest {
  @IsNumberString()
  @IsNotEmpty()
  lockId: string

  @IsString()
  @IsOptional()
  partition?: string
}
