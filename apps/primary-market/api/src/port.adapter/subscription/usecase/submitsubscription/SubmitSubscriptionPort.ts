// SPDX-License-Identifier: Apache-2.0

import { SubscriptionSubmittedDLTEvent } from "./model/SubscriptionSubmittedDLTEvent"

export interface SubmitSubscriptionPort {
  handle(event: SubscriptionSubmittedDLTEvent): Promise<void>
}
