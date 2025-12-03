// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { BaseRepository } from "@hashgraph/green-bonds-shared-core"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "@domain/bond/clearing/model/ClearingHold"
import { BondClearingHoldPersistence } from "../model/BondClearingHoldPersistence"
import { ClearingHoldRepository } from "@domain/bond/clearing/repository/ClearingHoldRepository"

@Injectable()
export class ClearingHoldTypeOrmRepository
  extends BaseRepository<BondClearingHoldPersistence>
  implements ClearingHoldRepository
{
  constructor() {
    super(BondClearingHoldPersistence)
  }

  async save(clearing: ClearingHold, transactionId?: string): Promise<ClearingHold> {
    return (await this.getRepository(transactionId).save(clearing as unknown as BondClearingHoldPersistence)) as ClearingHold
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingHold | null> {
    const persistence = await this.getRepository().findOne({
      where: { bondContractId, holderAccountId, id: clearingId },
    })
    if (!persistence) return null
    return Object.assign(new ClearingHold(), persistence)
  }

  async findAllByHolder(
    bondContractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<ClearingHold>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.getRepository().findAndCount({
      where: { bondContractId, holderAccountId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => Object.assign(new ClearingHold(), p))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async update(clearing: ClearingHold, transactionId?: string): Promise<ClearingHold> {
    return (await this.getRepository(transactionId).save(clearing as unknown as BondClearingHoldPersistence)) as ClearingHold
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.getRepository().delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
