// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class CancelOfferingTransactionRequest extends BaseTransactionRequest {
  @IsNotEmpty()
  @IsNumberString()
  start: string

  @IsNotEmpty()
  @IsNumberString()
  end: string
}
