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

  private toDomain(persistence: BondClearingHoldPersistence): ClearingHold {
    const clearing = new ClearingHold()
    clearing.id = persistence.id
    clearing.bondContractId = persistence.bondContractId
    clearing.holderAccountId = persistence.holderAccountId
    clearing.partition = persistence.partition
    clearing.amount = persistence.amount
    clearing.expirationDate = persistence.expirationDate
    clearing.status = persistence.status
    clearing.toAddress = persistence.toAddress
    clearing.escrowAddress = persistence.escrowAddress
    clearing.data = persistence.data
    clearing.operatorData = persistence.operatorData
    clearing.operator = persistence.operator
    clearing.createdAt = persistence.createdAt
    clearing.updatedAt = persistence.updatedAt
    return clearing
  }

  async save(clearing: ClearingHold): Promise<ClearingHold> {
    const saved = await this.repository.save(clearing as BondClearingHoldPersistence)
    return this.toDomain(saved)
  }

  async findById(bondContractId: string, holderAccountId: string, clearingId: number): Promise<ClearingHold | null> {
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
    const updated = await this.repository.save(clearing as BondClearingHoldPersistence)
    return this.toDomain(updated)
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
