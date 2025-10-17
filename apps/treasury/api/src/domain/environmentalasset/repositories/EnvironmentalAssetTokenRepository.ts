// SPDX-License-Identifier: Apache-2.0

import { EnvironmentalAssetToken } from "../model/EnvironmentalAssetToken"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface EnvironmentalAssetTokenRepository {
  save(token: EnvironmentalAssetToken): Promise<EnvironmentalAssetToken>

  softDelete(token: EnvironmentalAssetToken): Promise<void>

  findAllByEnvironmentalAssetId(
    environmentalAssetId: string,
    options: PageOptions,
  ): Promise<Page<EnvironmentalAssetToken>>

  findByEnvironmentalAssetIdAndTokenId(
    environmentalAssetId: string,
    tokenId: number,
  ): Promise<EnvironmentalAssetToken | null>
}
