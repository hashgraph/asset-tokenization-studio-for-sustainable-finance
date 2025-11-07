// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondCouponRepository } from "@domain/bond/coupon/repository/BondCouponRepository"
import { GetBondCouponsQuery } from "./GetBondCouponsQuery"
import { GetBondCouponsQueryResponse } from "./GetBondCouponsQueryResponse"

@Singleton()
@Handler(GetBondCouponsQuery)
export class GetBondCouponsQueryHandler implements QueryHandler<GetBondCouponsQuery, GetBondCouponsQueryResponse> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondCouponRepository: BondCouponRepository,
  ) {}

  @Validate()
  async execute(query: GetBondCouponsQuery): Promise<GetBondCouponsQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const coupons = await this.bondCouponRepository.findAllByContractId(query.bondContractId)

    return {
      couponIds: coupons.map((coupon) => coupon.couponId),
    }
  }
}
