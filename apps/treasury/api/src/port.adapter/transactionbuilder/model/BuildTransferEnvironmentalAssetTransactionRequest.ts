// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildTransferEnvironmentalAssetTransactionRequest extends BaseBuildTransactionRequest {
  assetContractId: string
  tokenId: string
  to: string
}
