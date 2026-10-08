// SPDX-License-Identifier: Apache-2.0

import { RedemptionHolder } from "@domain/redemption/model/RedemptionHolder"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"

export interface RedemptionHolderRepository {
  save(redemptionHolder: RedemptionHolder): Promise<RedemptionHolder>

  existsByTreasuryAndIdHolderAccountIdAndStatus(
    treasuryId: string,
    holderAccountId: string,
    status: RedemptionHolderStatus,
  ): Promise<boolean>

  findOneByTreasuryIdAndHolderAccountIdAndStatus(
    treasuryId: string,
    holderAccountId: string,
    status: RedemptionHolderStatus,
  ): Promise<RedemptionHolder>

  findByTreasuryId(treasuryId: string, pageOptions: PageOptions, status?: string): Promise<Page<RedemptionHolder>>
}
