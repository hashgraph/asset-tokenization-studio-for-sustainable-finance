// SPDX-License-Identifier: Apache-2.0

import { PaymentTokenUpdatedDLTEvent } from "./model/PaymentTokenUpdatedDLTEvent"

export interface UpdatePaymentTokenPort {
  handle(event: PaymentTokenUpdatedDLTEvent): Promise<void>
}
