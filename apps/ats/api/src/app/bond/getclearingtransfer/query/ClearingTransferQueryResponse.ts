// SPDX-License-Identifier: Apache-2.0
export class ClearingTransferQueryResponse {
  id: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationDate: Date
  status: string
  toAddress: string
  data?: string
  operatorData?: string
  operator: string
  createdAt: Date
  updatedAt: Date
}
