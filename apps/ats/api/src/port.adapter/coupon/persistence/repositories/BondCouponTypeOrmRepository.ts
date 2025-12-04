// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondCoupon } from "@domain/coupon/model/BondCoupon"
import { BondCouponPersistence } from "../model/BondCouponPersistence"
import type { BondCouponRepository } from "@domain/coupon/repository/BondCouponRepository"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

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

  async findAllByContractIdPaginated(contractId: string, options: PageOptions): Promise<Page<BondCoupon>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      where: { contractId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondCoupon)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }
}
