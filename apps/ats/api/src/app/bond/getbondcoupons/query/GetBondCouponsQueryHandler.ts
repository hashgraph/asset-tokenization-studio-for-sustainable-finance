// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondCouponRepository } from "@domain/bond/coupon/repository/BondCouponRepository"
import { GetBondCouponsQuery } from "./GetBondCouponsQuery"
import { BondCouponsQueryResponse } from "./BondCouponsQueryResponse"

@Singleton()
@Handler(GetBondCouponsQuery)
export class GetBondCouponsQueryHandler implements QueryHandler<GetBondCouponsQuery, BondCouponsQueryResponse> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondCouponRepository: BondCouponRepository,
  ) {}

  @Validate()
  async execute(query: GetBondCouponsQuery): Promise<BondCouponsQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondCouponRepository.findAllByContractIdPaginated(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return {
      couponIds: page.items.map((coupon) => coupon.couponId),
    }
  }
}
