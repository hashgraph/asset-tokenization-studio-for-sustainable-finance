// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsDefined, IsNotEmpty } from "class-validator"

export class TransferEnvironmentalAssetTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  readonly assetContractId: string

  @IsDefined()
  readonly tokenId: number

  @IsNotEmpty()
  readonly to: string

  constructor(
    assetContractId: string,
    format: string,
    accountId: string,
    contractId: string,
    tokenId: number,
    to: string,
  ) {
    super(format, accountId, contractId)
    this.assetContractId = assetContractId
    this.tokenId = tokenId
    this.to = to
  }
}
