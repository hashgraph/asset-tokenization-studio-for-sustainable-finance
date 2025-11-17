// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class AddProceedRecipientTransactionRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string

  @IsString()
  @IsOptional()
  data?: string
}
