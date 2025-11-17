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

  private toDomain(persistence: BondClearingRedeemPersistence): ClearingRedeem {
    const clearing = new ClearingRedeem()
    clearing.id = persistence.id
    clearing.bondContractId = persistence.bondContractId
    clearing.holderAccountId = persistence.holderAccountId
    clearing.partition = persistence.partition
    clearing.amount = persistence.amount
    clearing.expirationDate = persistence.expirationDate
    clearing.status = persistence.status
    clearing.data = persistence.data
    clearing.operatorData = persistence.operatorData
    clearing.operatorAccountId = persistence.operatorAccountId
    clearing.createdAt = persistence.createdAt
    clearing.updatedAt = persistence.updatedAt
    return clearing
  }

  private toPersistence(clearing: ClearingRedeem): BondClearingRedeemPersistence {
    const persistence = new BondClearingRedeemPersistence()
    persistence.id = clearing.id
    persistence.bondContractId = clearing.bondContractId
    persistence.holderAccountId = clearing.holderAccountId
    persistence.partition = clearing.partition
    persistence.amount = clearing.amount
    persistence.expirationDate = clearing.expirationDate
    persistence.status = clearing.status
    persistence.data = clearing.data
    persistence.operatorData = clearing.operatorData
    persistence.operatorAccountId = clearing.operatorAccountId
    persistence.createdAt = clearing.createdAt
    persistence.updatedAt = clearing.updatedAt
    return persistence
  }

  async save(clearing: ClearingRedeem): Promise<ClearingRedeem> {
    const persistence = this.toPersistence(clearing)
    const saved = await this.repository.save(persistence)
    return this.toDomain(saved)
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingRedeem | null> {
    const persistence = await this.repository.findOne({
      where: { bondContractId, holderAccountId, id: clearingId },
    })
    return persistence ? this.toDomain(persistence) : null
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

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async update(clearing: ClearingRedeem): Promise<ClearingRedeem> {
    const persistence = this.toPersistence(clearing)
    const updated = await this.repository.save(persistence)
    return this.toDomain(updated)
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
