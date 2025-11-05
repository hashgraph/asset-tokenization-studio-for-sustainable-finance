// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class DeleteControlListMemberTransactionAppServiceRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  constructor(format: string, accountId: string, contractId: string, holderAccountId: string) {
    super(format, accountId, contractId)
    this.holderAccountId = holderAccountId
  }
}
