// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondHoldRepository } from "@domain/bond/hold/repository/BondHoldRepository"
import { BondHold } from "@domain/bond/hold/model/BondHold"
import { BondHoldPersistence } from "../model/BondHoldPersistence"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondHoldTypeOrmRepository implements BondHoldRepository {
  constructor(
    @InjectRepository(BondHoldPersistence)
    private readonly repository: Repository<BondHoldPersistence>,
  ) {}

  async save(bondHold: BondHold): Promise<BondHold> {
    return (await this.repository.save(bondHold as unknown as BondHoldPersistence)) as BondHold
  }

  async findById(id: number): Promise<BondHold | null> {
    return (await this.repository.findOne({
      where: { id },
    })) as BondHold | null
  }

  async findByContractIdAndHolderAndHoldId(
    contractId: string,
    holderAccountId: string,
    holdId: number,
  ): Promise<BondHold | null> {
    return (await this.repository.findOne({
      where: { contractId, holderAccountId, id: holdId },
    })) as BondHold | null
  }

  async findByContractIdAndHolder(
    contractId: string,
    holderAccountId: string,
    page: number,
    pageSize: number,
  ): Promise<BondHold[]> {
    const persistences = await this.repository.find({
      where: { contractId, holderAccountId },
      order: { createdAt: "DESC" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })

    return persistences.map((p) => p as BondHold)
  }

  async countByContractIdAndHolder(contractId: string, holderAccountId: string): Promise<number> {
    return await this.repository.count({
      where: { contractId, holderAccountId },
    })
  }

  async findByContractIdAndHolderPaginated(
    contractId: string,
    holderAccountId: string,
    pageOptions: PageOptions,
  ): Promise<Page<BondHold>> {
    const [persistences, total] = await this.repository.findAndCount({
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
}
