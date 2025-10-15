// SPDX-License-Identifier: Apache-2.0

import { TransferType } from "@domain/shared/model/TransferType"

export class EnvironmentalAssetTransferQueryResponse {
  accountId: string
  tokenId: number
  type: TransferType
  transferDate: Date
}
