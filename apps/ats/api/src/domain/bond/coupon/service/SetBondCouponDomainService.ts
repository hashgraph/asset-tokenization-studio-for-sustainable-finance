// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondCouponDomainServiceRequest } from "./model/SetBondCouponDomainServiceRequest"
import { BondCoupon } from "@domain/bond/coupon/model/BondCoupon"
import type { BondCouponRepository } from "../repository/BondCouponRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class SetBondCouponDomainService {
  constructor(
    @Inject() private readonly bondCouponRepository: BondCouponRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondCouponDomainServiceRequest): Promise<BondCoupon> {
    await this.checkBondExistsDomainService.execute(request.contractId)

    const existingCoupon = await this.bondCouponRepository.findByContractIdAndCouponId(
      request.contractId,
      request.couponId,
    )

    if (existingCoupon) {
      return existingCoupon
    }

    const coupon = Object.assign(new BondCoupon(), {
      contractId: request.contractId,
      corporateActionId: request.corporateActionId,
      couponId: request.couponId,
      operator: request.operator,
      recordDate: request.recordDate,
      executionDate: request.executionDate,
      rate: request.rate,
      rateDecimals: request.rateDecimals,
      period: request.period,
    })

    return await this.bondCouponRepository.save(coupon)
  }
}
