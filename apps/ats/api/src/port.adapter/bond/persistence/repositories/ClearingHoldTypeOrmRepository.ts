// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "@domain/bond/clearing/model/ClearingHold"
import { BondClearingHoldPersistence } from "../model/BondClearingHoldPersistence"
import { ClearingHoldRepository } from "@domain/bond/clearing/repository/ClearingHoldRepository"

@Injectable()
export class ClearingHoldTypeOrmRepository implements ClearingHoldRepository {
  constructor(
    @InjectRepository(BondClearingHoldPersistence)
    private readonly repository: Repository<BondClearingHoldPersistence>,
  ) {}

  async save(clearing: ClearingHold): Promise<ClearingHold> {
    return (await this.repository.save(clearing as unknown as BondClearingHoldPersistence)) as ClearingHold
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingHold | null> {
    const persistence = await this.repository.findOne({
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
    const [persistences, total] = await this.repository.findAndCount({
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

  async update(clearing: ClearingHold): Promise<ClearingHold> {
    return (await this.repository.save(clearing as unknown as BondClearingHoldPersistence)) as ClearingHold
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
