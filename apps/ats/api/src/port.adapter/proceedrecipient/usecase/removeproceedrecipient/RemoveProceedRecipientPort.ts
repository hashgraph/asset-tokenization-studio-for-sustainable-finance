// SPDX-License-Identifier: Apache-2.0
import { ProceedRecipientRemovedDLTEvent } from "./model/ProceedRecipientRemovedDLTEvent"

export interface RemoveProceedRecipientPort {
  handle(event: ProceedRecipientRemovedDLTEvent): Promise<void>
}
