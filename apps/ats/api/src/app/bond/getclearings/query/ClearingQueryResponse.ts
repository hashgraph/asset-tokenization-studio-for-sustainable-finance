// SPDX-License-Identifier: Apache-2.0

export class ClearingQueryResponse {
  id: string
  bondContractId: string
  holderAccountId: string
  clearingId: number
  partition: string
  amount: string
  expirationDate: Date
  status: string
  toAddress?: string
  escrowAddress?: string
  data?: string
  operatorData?: string
  operator: string
}
