// SPDX-License-Identifier: Apache-2.0

import { OfferingCreatedDLTEvent } from "./model/OfferingCreatedDLTEvent"

export interface CreateOfferingPort {
  handle(event: OfferingCreatedDLTEvent): Promise<void>
}
