// SPDX-License-Identifier: Apache-2.0
import { ProceedRecipientAddedDLTEvent } from "./model/ProceedRecipientAddedDLTEvent"

export interface AddProceedRecipientPort {
  handle(event: ProceedRecipientAddedDLTEvent): Promise<void>
}
