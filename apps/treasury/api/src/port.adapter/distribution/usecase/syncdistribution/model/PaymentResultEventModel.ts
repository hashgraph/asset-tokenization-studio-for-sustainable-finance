// SPDX-License-Identifier: Apache-2.0

export interface PaymentResultEventModel {
  failedAddresses: string[]
  succeededAddresses: string[]
  alreadyPaidAddresses: string[]
  paidAmounts: string[]
}
