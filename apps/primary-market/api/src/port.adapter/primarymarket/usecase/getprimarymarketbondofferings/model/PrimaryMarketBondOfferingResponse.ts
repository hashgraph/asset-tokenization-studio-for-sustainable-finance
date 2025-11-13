// SPDX-License-Identifier: Apache-2.0

import { OfferingStatus } from "@domain/offering/model/OfferingStatus"

export class PrimaryMarketBondOfferingResponse {
  id: number
  bondContractId: string
  operatorAccountId: string
  treasuryContractId: string
  paymentTokenContractId: string
  lotSize: string
  minLots: string
  maxLots: string
  targetLots: string
  targetQuantityRule: number
  startDate: Date
  endDate: Date
  deadlineRule: number
  price: string
  status: OfferingStatus
  createdAt: Date
}
