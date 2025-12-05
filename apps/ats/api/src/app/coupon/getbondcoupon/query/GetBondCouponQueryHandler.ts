// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondCouponRepository } from "@domain/coupon/repository/BondCouponRepository"
import { GetBondCouponQuery } from "./GetBondCouponQuery"
import { BondCouponQueryResponse } from "./BondCouponQueryResponse"
import { BondCouponNotFoundError } from "@domain/coupon/errors/BondCouponNotFoundError"

@Singleton()
@Handler(GetBondCouponQuery)
export class GetBondCouponQueryHandler implements QueryHandler<GetBondCouponQuery, BondCouponQueryResponse> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondCouponRepository: BondCouponRepository,
  ) {}

  @Validate()
  async execute(query: GetBondCouponQuery): Promise<BondCouponQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const coupon = await this.bondCouponRepository.findByContractIdAndCouponId(query.bondContractId, query.couponId)

    if (!coupon) {
      throw BondCouponNotFoundError.couponIdError(query.bondContractId, query.couponId)
    }

    return {
      id: coupon.id,
      contractId: coupon.contractId,
      corporateActionId: coupon.corporateActionId,
      couponId: coupon.couponId,
      operator: coupon.operator,
      recordDate: coupon.recordDate,
      executionDate: coupon.executionDate,
      rate: coupon.rate,
      rateDecimals: coupon.rateDecimals,
      period: coupon.period,
    }
  }
}
