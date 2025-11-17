// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class BuildRemoveProceedRecipientTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string
}
