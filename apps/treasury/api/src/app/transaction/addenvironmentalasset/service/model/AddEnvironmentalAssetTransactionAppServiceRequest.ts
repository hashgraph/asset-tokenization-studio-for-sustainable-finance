// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class AddEnvironmentalAssetTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  readonly assetId: string

  constructor(assetId: string, format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
    this.assetId = assetId
  }
}
