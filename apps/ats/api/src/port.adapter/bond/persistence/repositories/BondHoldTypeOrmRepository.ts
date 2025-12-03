// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { BondHoldRepository } from "@domain/bond/hold/repository/BondHoldRepository"
import { BondHold } from "@domain/bond/hold/model/BondHold"
import { BondHoldPersistence } from "../model/BondHoldPersistence"
import { BaseRepository } from "@hashgraph/green-bonds-shared-core"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondHoldTypeOrmRepository extends BaseRepository<BondHoldPersistence> implements BondHoldRepository {
  constructor() {
    super(BondHoldPersistence)
  }

  async save(bondHold: BondHold, transactionId?: string): Promise<BondHold> {
    return (await this.getRepository(transactionId).save(bondHold as unknown as BondHoldPersistence)) as BondHold
  }

  async findById(id: number, contractId: string, holderAccountId: string, partition: string): Promise<BondHold | null> {
    return (await this.getRepository().findOne({
      where: { id, contractId, holderAccountId, partition },
    })) as BondHold | null
  }

  async findByContractIdAndHolderAndHoldId(
    contractId: string,
    holderAccountId: string,
    holdId: number,
    partition: string,
  ): Promise<BondHold | null> {
    return (await this.getRepository().findOne({
      where: { contractId, holderAccountId, id: holdId, partition },
    })) as BondHold | null
  }

  async findByContractIdAndHolder(
    contractId: string,
    holderAccountId: string,
    page: number,
    pageSize: number,
  ): Promise<BondHold[]> {
    const persistences = await this.getRepository().find({
      where: { contractId, holderAccountId },
      order: { createdAt: "DESC" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })

    return persistences.map((p) => p as BondHold)
  }

  async countByContractIdAndHolder(contractId: string, holderAccountId: string): Promise<number> {
    return await this.getRepository().count({
      where: { contractId, holderAccountId },
    })
  }

  async findByContractIdAndHolderPaginated(
    contractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<BondHold>> {
    const [persistences, total] = await this.getRepository().findAndCount({
      where: { contractId, holderAccountId },
      order: { createdAt: "DESC" },
      take: pageOptions.limit,
      skip: (pageOptions.page - 1) * pageOptions.limit,
    })

    return {
      items: persistences.map((p) => p as BondHold),
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  async deleteByIdAndContractIdAndHolderAccountId(
    id: number,
    contractId: string,
    holderAccountId: string,
    partition: string,
  ): Promise<void> {
    await this.getRepository().delete({ id, contractId, holderAccountId, partition })
  }
}
