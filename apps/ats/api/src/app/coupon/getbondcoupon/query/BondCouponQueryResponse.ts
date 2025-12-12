// SPDX-License-Identifier: Apache-2.0
export interface BondCouponQueryResponse {
  id: string
  bondContractId: string
  corporateActionId: string
  operator: string
  recordDate: Date
  executionDate: Date
  rate: string
  rateDecimals: string
  period: string
}
