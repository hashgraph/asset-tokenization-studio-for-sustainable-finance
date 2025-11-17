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

  private toDomain(persistence: BondClearingHoldPersistence): ClearingHold {
    const clearing = new ClearingHold()
    clearing.id = persistence.id
    clearing.bondContractId = persistence.bondContractId
    clearing.holderAccountId = persistence.holderAccountId
    clearing.partition = persistence.partition
    clearing.amount = persistence.amount
    clearing.expirationDate = persistence.expirationDate
    clearing.status = persistence.status
    clearing.toAccountId = persistence.toAccountId
    clearing.escrowAccountId = persistence.escrowAccountId
    clearing.data = persistence.data
    clearing.operatorData = persistence.operatorData
    clearing.operatorAccountId = persistence.operatorAccountId
    clearing.createdAt = persistence.createdAt
    clearing.updatedAt = persistence.updatedAt
    return clearing
  }

  private toPersistence(clearing: ClearingHold): BondClearingHoldPersistence {
    const persistence = new BondClearingHoldPersistence()
    persistence.id = clearing.id
    persistence.bondContractId = clearing.bondContractId
    persistence.holderAccountId = clearing.holderAccountId
    persistence.partition = clearing.partition
    persistence.amount = clearing.amount
    persistence.expirationDate = clearing.expirationDate
    persistence.status = clearing.status
    persistence.toAccountId = clearing.toAccountId
    persistence.escrowAccountId = clearing.escrowAccountId
    persistence.data = clearing.data
    persistence.operatorData = clearing.operatorData
    persistence.operatorAccountId = clearing.operatorAccountId
    persistence.createdAt = clearing.createdAt
    persistence.updatedAt = clearing.updatedAt
    return persistence
  }

  async save(clearing: ClearingHold): Promise<ClearingHold> {
    const persistence = this.toPersistence(clearing)
    const saved = await this.repository.save(persistence)
    return this.toDomain(saved)
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingHold | null> {
    const persistence = await this.repository.findOne({
      where: { bondContractId, holderAccountId, id: clearingId },
    })
    return persistence ? this.toDomain(persistence) : null
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

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async update(clearing: ClearingHold): Promise<ClearingHold> {
    const persistence = this.toPersistence(clearing)
    const updated = await this.repository.save(persistence)
    return this.toDomain(updated)
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
