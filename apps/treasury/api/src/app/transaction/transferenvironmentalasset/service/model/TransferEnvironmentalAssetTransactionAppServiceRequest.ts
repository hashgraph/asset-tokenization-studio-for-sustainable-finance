// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class TransferEnvironmentalAssetTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  readonly assetContractId: string

  @IsNotEmpty()
  readonly tokenId: string

  @IsNotEmpty()
  readonly to: string

  constructor(
    assetContractId: string,
    format: string,
    accountId: string,
    contractId: string,
    tokenId: string,
    to: string,
  ) {
    super(format, accountId, contractId)
    this.assetContractId = assetContractId
    this.tokenId = tokenId
    this.to = to
  }
}
