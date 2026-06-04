// SPDX-License-Identifier: Apache-2.0
export interface GetBondImpactDataQueryResponse {
  id: string
  bondContractId: string
  operator: string
  maxDeviationCap: string
  baseLine: string
  maxDeviationFloor: string
  impactDataDecimals: string
  adjustmentPrecision: string
  createdAt: Date
  updatedAt: Date
}
