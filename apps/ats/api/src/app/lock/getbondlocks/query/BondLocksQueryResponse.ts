// SPDX-License-Identifier: Apache-2.0

export class BondLocksQueryResponse {
  id: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationTimestamp: Date
  operatorAccountId: string
  createdAt: Date
  updatedAt: Date
}
