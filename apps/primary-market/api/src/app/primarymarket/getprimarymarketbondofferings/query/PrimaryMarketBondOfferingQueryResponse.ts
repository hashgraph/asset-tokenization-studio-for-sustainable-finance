// SPDX-License-Identifier: Apache-2.0

export class PrimaryMarketBondOfferingQueryResponse {
  offeringDltId: string
  bondContractId: string
  operatorId: string
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
}
