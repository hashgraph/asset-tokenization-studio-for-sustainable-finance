// SPDX-License-Identifier: Apache-2.0

export class AddEnvironmentalAssetTransferAppServiceRequest {
  readonly environmentalAssetContractId: string
  readonly fromAccountId: string
  readonly toAccountId: string
  readonly tokenId?: number
}
