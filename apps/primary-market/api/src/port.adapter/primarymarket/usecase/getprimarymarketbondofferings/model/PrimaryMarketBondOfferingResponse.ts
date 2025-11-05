// SPDX-License-Identifier: Apache-2.0

export class PrimaryMarketBondOfferingResponse {
  offeringId: string
  bondId: string
  operatorId: string
  treasuryId: string
  paymentTokenId: string
  lotSize: string
  minQuantity: string
  maxQuantity: string
  targetQuantity: string
  targetQuantityRule: number
  startDate: Date
  endDate: Date
  deadlineRule: number
}
