// SPDX-License-Identifier: Apache-2.0

import { TransferType } from "@domain/shared/model/TransferType"

export class EnvironmentalAssetTransferResponse {
  accountId: string
  tokenId: number
  type: TransferType
  transferDate: Date
}
