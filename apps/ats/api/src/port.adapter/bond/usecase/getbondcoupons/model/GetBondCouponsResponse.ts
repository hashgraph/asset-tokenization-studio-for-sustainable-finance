// SPDX-License-Identifier: Apache-2.0
import { GetBondCouponsQueryResponse } from "@app/bond/getbondcoupons/query/GetBondCouponsQueryResponse"

export class GetBondCouponsResponse {
  couponIds: string[]

  static fromGetBondCouponsQueryResponse(queryResponse: GetBondCouponsQueryResponse): GetBondCouponsResponse {
    const response = new GetBondCouponsResponse()
    response.couponIds = queryResponse.couponIds
    return response
  }
}
