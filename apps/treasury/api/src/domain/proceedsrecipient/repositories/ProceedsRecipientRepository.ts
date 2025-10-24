// SPDX-License-Identifier: Apache-2.0

import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"

export interface ProceedsRecipientRepository {
  save(proceedsRecipient: ProceedsRecipient): Promise<ProceedsRecipient>
}
