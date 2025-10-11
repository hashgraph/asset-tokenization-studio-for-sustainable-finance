// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class AddEnvironmentalAssetTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  readonly assetContractId: string

  constructor(assetContractId: string, format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
    this.assetContractId = assetContractId
  }
}
