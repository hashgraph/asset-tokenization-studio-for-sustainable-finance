// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class ExecuteHoldRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @IsString()
  @IsNotEmpty()
  amount: string
}
