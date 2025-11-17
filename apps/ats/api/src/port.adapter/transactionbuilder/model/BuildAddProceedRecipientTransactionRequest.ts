// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class BuildAddProceedRecipientTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string

  @IsString()
  @IsOptional()
  data?: string
}
