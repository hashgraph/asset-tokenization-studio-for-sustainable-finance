// SPDX-License-Identifier: Apache-2.0
import { GetBondCouponQueryResponse } from "@app/bond/getbondcoupon/query/GetBondCouponQueryResponse"

export class GetBondCouponResponse {
  id: string
  contractId: string
  corporateActionId: string
  couponId: string
  operator: string
  recordDate: Date
  executionDate: Date
  rate: string

  static fromGetBondCouponQueryResponse(queryResponse: GetBondCouponQueryResponse): GetBondCouponResponse {
    const response = new GetBondCouponResponse()
    response.id = queryResponse.id
    response.contractId = queryResponse.contractId
    response.corporateActionId = queryResponse.corporateActionId
    response.couponId = queryResponse.couponId
    response.operator = queryResponse.operator
    response.recordDate = queryResponse.recordDate
    response.executionDate = queryResponse.executionDate
    response.rate = queryResponse.rate
    return response
  }
}
