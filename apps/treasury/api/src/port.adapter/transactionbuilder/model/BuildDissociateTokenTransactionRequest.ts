// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class BuildDissociateTokenTransactionRequest extends BaseBuildTransactionRequest {
  @IsNotEmpty()
  readonly tokenContractId: string

  constructor(tokenContractId: string, format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
    this.tokenContractId = tokenContractId
  }
}
