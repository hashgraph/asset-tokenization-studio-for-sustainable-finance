// SPDX-License-Identifier: Apache-2.0

import { OfferingCancelledDLTEvent } from "./model/OfferingCancelledDLTEvent"

export interface CancelOfferingPort {
  handle(event: OfferingCancelledDLTEvent): Promise<void>
}
