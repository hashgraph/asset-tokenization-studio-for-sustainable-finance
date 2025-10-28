// SPDX-License-Identifier: Apache-2.0

import { ProceedsRecipientFundedDLTEvent } from "@port/proceedsrecipient/usecase/syncproceedsrecipient/model/ProceedsRecipientFundedDLTEvent"

export interface SyncProceedsRecipientPort {
  handle(event: ProceedsRecipientFundedDLTEvent): Promise<void>
}
