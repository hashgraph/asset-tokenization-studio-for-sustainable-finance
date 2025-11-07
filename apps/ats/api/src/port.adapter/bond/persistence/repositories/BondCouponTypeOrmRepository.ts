// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondCoupon } from "@domain/bond/coupon/model/BondCoupon"
import { BondCouponPersistence } from "../model/BondCouponPersistence"
import { BondCouponRepository } from "@domain/bond/coupon/repository/BondCouponRepository"

@Injectable()
export class BondCouponTypeOrmRepository implements BondCouponRepository {
  constructor(
    @InjectRepository(BondCouponPersistence)
    private readonly repository: Repository<BondCouponPersistence>,
  ) {}

  async save(coupon: BondCoupon): Promise<BondCoupon> {
    return (await this.repository.save(coupon as BondCouponPersistence)) as BondCoupon
  }

  async findByContractIdAndCouponId(contractId: string, couponId: string): Promise<BondCoupon | null> {
    return (await this.repository.findOne({ where: { contractId, couponId } })) as BondCoupon | null
  }

  async findAllByContractId(contractId: string): Promise<BondCoupon[]> {
    const persistences = await this.repository.find({
      where: { contractId },
      order: { couponId: "ASC" },
    })
    return persistences.map((p) => p as BondCoupon)
  }
}
