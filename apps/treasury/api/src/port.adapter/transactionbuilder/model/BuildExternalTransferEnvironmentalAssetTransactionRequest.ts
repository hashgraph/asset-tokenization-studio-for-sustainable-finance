// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, Min } from "class-validator"

export class BuildExternalTransferEnvironmentalAssetTransactionRequest extends BaseBuildTransactionRequest {
  @IsNotEmpty()
  treasuryContractId: string

  @Min(0)
  tokenId: number

  @IsNotEmpty()
  accountId: string

  constructor(format: string, accountId: string, contractId: string, treasuryContractId: string, tokenId: number) {
    super(format, accountId, contractId)
    this.treasuryContractId = treasuryContractId
    this.tokenId = tokenId
    this.accountId = accountId
  }
}
