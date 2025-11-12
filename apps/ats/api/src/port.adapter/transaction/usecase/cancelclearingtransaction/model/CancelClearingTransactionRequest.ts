// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsOptional, IsString } from "class-validator"

export class CancelClearingTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsString()
  partition?: string
}
