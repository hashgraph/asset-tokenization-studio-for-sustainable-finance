// SPDX-License-Identifier: Apache-2.0

import { OfferingExecutedDLTEvent } from "./model/OfferingExecutedDLTEvent"

export interface ExecuteOfferingPort {
  handle(event: OfferingExecutedDLTEvent): Promise<void>
}
