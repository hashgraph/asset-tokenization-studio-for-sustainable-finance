// SPDX-License-Identifier: Apache-2.0

import { RedemptionHolder } from "@domain/redemption/model/RedemptionHolder"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface RedemptionHolderRepository {
  save(redemptionHolder: RedemptionHolder): Promise<RedemptionHolder>
  findByTreasuryId(treasuryId: string, pageOptions: PageOptions, status?: string): Promise<Page<RedemptionHolder>>
}
