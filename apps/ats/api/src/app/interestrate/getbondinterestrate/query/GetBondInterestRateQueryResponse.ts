// SPDX-License-Identifier: Apache-2.0
export interface GetBondInterestRateQueryResponse {
  id: string
  bondContractId: string
  operator: string
  maxRate: string
  baseRate: string
  minRate: string
  startPeriod: string
  startRate: string
  missedPenalty: string
  reportPeriod: string
  rateDecimals: string
  createdAt: Date
  updatedAt: Date
}
