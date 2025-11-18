// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "@domain/bond/clearing/model/ClearingRedeem"
import { BondClearingRedeemPersistence } from "../model/BondClearingRedeemPersistence"
import { ClearingRedeemRepository } from "@domain/bond/clearing/repository/ClearingRedeemRepository"

@Injectable()
export class ClearingRedeemTypeOrmRepository implements ClearingRedeemRepository {
  constructor(
    @InjectRepository(BondClearingRedeemPersistence)
    private readonly repository: Repository<BondClearingRedeemPersistence>,
  ) {}

  async save(clearing: ClearingRedeem): Promise<ClearingRedeem> {
    return (await this.repository.save(clearing as unknown as BondClearingRedeemPersistence)) as ClearingRedeem
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingRedeem | null> {
    const persistence = await this.repository.findOne({
      where: { bondContractId, holderAccountId, id: clearingId },
    })
    if (!persistence) return null
    return Object.assign(new ClearingRedeem(), persistence)
  }

  async findAllByHolder(
    bondContractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<ClearingRedeem>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      where: { bondContractId, holderAccountId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => Object.assign(new ClearingRedeem(), p))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async update(clearing: ClearingRedeem): Promise<ClearingRedeem> {
    return (await this.repository.save(clearing as unknown as BondClearingRedeemPersistence)) as ClearingRedeem
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
