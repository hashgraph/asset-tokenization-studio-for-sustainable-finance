// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, Matches } from "class-validator"
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class ReleaseHoldRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  amount: string
}
