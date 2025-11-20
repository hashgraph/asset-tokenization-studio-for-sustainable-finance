// SPDX-License-Identifier: Apache-2.0

export class BondHoldQueryResponse {
  id: number
  contractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationTimestamp: Date
  escrowAccountId: string
  toAccountId: string
  data: string
  operatorData: string
  operatorAccountId: string
  createdAt: Date
  updatedAt: Date
}
