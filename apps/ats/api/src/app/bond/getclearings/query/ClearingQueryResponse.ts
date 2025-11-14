// SPDX-License-Identifier: Apache-2.0

export class ClearingHoldQueryResponse {
  id: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationDate: Date
  status: string
  holdId?: string
  toAddress?: string
  escrowAddress?: string
  data?: string
  operatorData?: string
  operator: string
  createdAt: Date
  updatedAt: Date
}

export class ClearingTransferQueryResponse {
  id: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationDate: Date
  status: string
  toAddress: string
  transferTransactionId?: string
  data?: string
  operatorData?: string
  operator: string
  createdAt: Date
  updatedAt: Date
}

export class ClearingRedeemQueryResponse {
  id: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationDate: Date
  status: string
  redeemTransactionId?: string
  data?: string
  operatorData?: string
  operator: string
  createdAt: Date
  updatedAt: Date
}

// Type for backward compatibility and general querying
export type ClearingQueryResponse = ClearingHoldQueryResponse | ClearingTransferQueryResponse | ClearingRedeemQueryResponse
