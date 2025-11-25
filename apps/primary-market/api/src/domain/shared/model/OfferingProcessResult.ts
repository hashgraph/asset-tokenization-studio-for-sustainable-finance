// SPDX-License-Identifier: Apache-2.0

import { OfferingProcessStatus } from "./OfferingProcessStatus"

export interface OfferingProcessResult {
  subscriptionId: number
  status: OfferingProcessStatus
}
