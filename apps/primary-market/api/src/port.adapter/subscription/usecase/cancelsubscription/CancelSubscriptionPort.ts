// SPDX-License-Identifier: Apache-2.0

import { SubscriptionCancelledDLTEvent } from "./model/SubscriptionCancelledDLTEvent"

export interface CancelSubscriptionPort {
  handle(event: SubscriptionCancelledDLTEvent): Promise<void>
}
