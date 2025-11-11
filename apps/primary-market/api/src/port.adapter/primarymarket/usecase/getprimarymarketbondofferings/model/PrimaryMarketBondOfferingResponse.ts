// SPDX-License-Identifier: Apache-2.0

import { OfferingStatus } from "@domain/offering/model/OfferingStatus"

export class PrimaryMarketBondOfferingResponse {
  offeringDltId: string
  bondContractId: string
  operatorAccountId: string
  treasuryContractId: string
  paymentTokenContractId: string
  lotSize: string
  minQuantity: string
  maxQuantity: string
  targetQuantity: string
  targetQuantityRule: number
  startDate: Date
  endDate: Date
  deadlineRule: number
  status: OfferingStatus
  createdAt: Date
}
