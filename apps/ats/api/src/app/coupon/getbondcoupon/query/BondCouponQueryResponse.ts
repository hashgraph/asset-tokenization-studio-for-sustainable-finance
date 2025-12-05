// SPDX-License-Identifier: Apache-2.0
export interface BondCouponQueryResponse {
  id: string
  contractId: string
  corporateActionId: string
  couponId: string
  operator: string
  recordDate: Date
  executionDate: Date
  rate: string
  rateDecimals: string
  period: string
}
