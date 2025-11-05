// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class BuildDeleteControlListMemberTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  holderAccountId: string
}
