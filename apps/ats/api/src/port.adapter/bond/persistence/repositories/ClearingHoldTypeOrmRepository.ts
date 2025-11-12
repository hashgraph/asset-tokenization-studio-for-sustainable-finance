// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "@domain/bond/clearinghold/model/ClearingHold"
import { BondClearingHoldPersistence } from "../model/BondClearingHoldPersistence"
import { ClearingHoldRepository } from "@domain/bond/clearinghold/repository/ClearingHoldRepository"

@Injectable()
export class ClearingHoldTypeOrmRepository implements ClearingHoldRepository {
  constructor(
    @InjectRepository(BondClearingHoldPersistence)
    private readonly repository: Repository<BondClearingHoldPersistence>,
  ) {}

  async save(clearing: ClearingHold): Promise<ClearingHold> {
    return (await this.repository.save(clearing as BondClearingHoldPersistence)) as ClearingHold
  }

  async findById(id: string): Promise<ClearingHold | null> {
    return (await this.repository.findOne({ where: { id } })) as ClearingHold | null
  }

  async findByClearingId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingHold | null> {
    return (await this.repository.findOne({
      where: { bondContractId, holderAccountId, clearingId },
    })) as ClearingHold | null
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

    const items = persistences.map((p) => p as ClearingHold)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async update(clearing: ClearingHold): Promise<ClearingHold> {
    return (await this.repository.save(clearing as BondClearingHoldPersistence)) as ClearingHold
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id })
  }
}
