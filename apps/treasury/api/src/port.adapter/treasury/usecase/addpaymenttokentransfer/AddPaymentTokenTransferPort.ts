// SPDX-License-Identifier: Apache-2.0

import { PaymentTokenTransferredDLTEvent } from "./model/PaymentTokenTransferredDLTEvent"

export interface AddPaymentTokenTransferPort {
  handle(event: PaymentTokenTransferredDLTEvent): Promise<void>
}
