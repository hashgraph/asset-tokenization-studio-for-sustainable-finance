// SPDX-License-Identifier: Apache-2.0
export interface GetBondCouponQueryResponse {
  id: string
  contractId: string
  corporateActionId: string
  couponId: string
  operator: string
  recordDate: Date
  executionDate: Date
  rate: string
}
