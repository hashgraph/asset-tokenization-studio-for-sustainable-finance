// SPDX-License-Identifier: Apache-2.0

export class PaymentTokenQueryResponse {
  contractId: string
  additionDate: Date
  removalDate: Date | null
  dissociationError: number | null
}
