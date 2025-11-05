// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class SetBondCapTransactionRequest extends BaseTransactionRequest {
  @IsNumberString()
  @IsNotEmpty()
  newMaxSupply: string
}
