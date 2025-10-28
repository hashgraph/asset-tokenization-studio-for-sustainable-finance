// SPDX-License-Identifier: Apache-2.0

import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface ProceedsRecipientRepository {
  save(proceedsRecipient: ProceedsRecipient): Promise<ProceedsRecipient>
  findByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<ProceedsRecipient | null>
  findByTreasuryId(treasuryId: string, pageOptions: PageOptions): Promise<Page<ProceedsRecipient>>
}
