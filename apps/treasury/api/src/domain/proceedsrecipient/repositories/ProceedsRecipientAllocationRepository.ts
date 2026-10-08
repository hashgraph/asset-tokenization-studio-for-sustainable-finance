// SPDX-License-Identifier: Apache-2.0

import { ProceedsRecipientAllocation } from "@domain/proceedsrecipient/model/ProceedsRecipientAllocation"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface ProceedsRecipientAllocationRepository {
  save(allocation: ProceedsRecipientAllocation): Promise<ProceedsRecipientAllocation>
  findByProceedsRecipientId(
    proceedsRecipientId: string,
    pageOptions: PageOptions,
  ): Promise<Page<ProceedsRecipientAllocation>>
}
