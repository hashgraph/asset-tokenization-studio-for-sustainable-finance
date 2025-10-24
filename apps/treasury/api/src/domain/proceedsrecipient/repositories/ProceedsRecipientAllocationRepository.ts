// SPDX-License-Identifier: Apache-2.0

import { ProceedsRecipientAllocation } from "@domain/proceedsrecipient/model/ProceedsRecipientAllocation"

export interface ProceedsRecipientAllocationRepository {
  save(allocation: ProceedsRecipientAllocation): Promise<ProceedsRecipientAllocation>
}
