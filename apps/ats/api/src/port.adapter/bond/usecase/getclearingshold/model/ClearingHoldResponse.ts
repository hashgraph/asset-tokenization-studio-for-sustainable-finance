// SPDX-License-Identifier: Apache-2.0
import { ClearingHold } from "@domain/bond/clearing/model/ClearingHold"

export class ClearingHoldResponse {
  id: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationDate: Date
  status: string
  toAddress?: string
  escrowAddress?: string
  data?: string
  operatorData?: string
  operator: string
  createdAt: Date
  updatedAt: Date
}
