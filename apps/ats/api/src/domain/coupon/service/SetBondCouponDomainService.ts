// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondCouponDomainServiceRequest } from "./model/SetBondCouponDomainServiceRequest"
import { BondCoupon } from "@domain/coupon/model/BondCoupon"
import type { BondCouponRepository } from "../repository/BondCouponRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class SetBondCouponDomainService {
  constructor(
    @Inject() private readonly bondCouponRepository: BondCouponRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondCouponDomainServiceRequest): Promise<BondCoupon> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)

    const existingCoupon = await this.bondCouponRepository.findByContractIdAndId(
      request.bondContractId,
      request.couponId,
    )

    if (existingCoupon) {
      return existingCoupon
    }

    const coupon = Object.assign(new BondCoupon(), {
      id: request.couponId,
      bondContractId: request.bondContractId,
      corporateActionId: request.corporateActionId,
      operator: request.operator,
      recordDate: request.recordDate,
      executionDate: request.executionDate,
      startDate: request.startDate,
      endDate: request.endDate,
      fixingDate: request.fixingDate,
      rate: request.rate,
      rateDecimals: request.rateDecimals,
      rateStatus: request.rateStatus,
    })

    return await this.bondCouponRepository.save(coupon)
  }
}
