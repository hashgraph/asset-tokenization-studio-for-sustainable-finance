// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "@domain/bond/clearing/model/ClearingTransfer"
import { BondClearingTransferPersistence } from "../model/BondClearingTransferPersistence"
import { ClearingTransferRepository } from "@domain/bond/clearing/repository/ClearingTransferRepository"

@Injectable()
export class ClearingTransferTypeOrmRepository implements ClearingTransferRepository {
  constructor(
    @InjectRepository(BondClearingTransferPersistence)
    private readonly repository: Repository<BondClearingTransferPersistence>,
  ) {}

  private toDomain(persistence: BondClearingTransferPersistence): ClearingTransfer {
    const clearing = new ClearingTransfer()
    clearing.id = persistence.id
    clearing.bondContractId = persistence.bondContractId
    clearing.holderAccountId = persistence.holderAccountId
    clearing.partition = persistence.partition
    clearing.amount = persistence.amount
    clearing.expirationDate = persistence.expirationDate
    clearing.status = persistence.status
    clearing.toAccountId = persistence.toAccountId
    clearing.data = persistence.data
    clearing.operatorData = persistence.operatorData
    clearing.operatorAccountId = persistence.operatorAccountId
    clearing.createdAt = persistence.createdAt
    clearing.updatedAt = persistence.updatedAt
    return clearing
  }

  private toPersistence(clearing: ClearingTransfer): BondClearingTransferPersistence {
    const persistence = new BondClearingTransferPersistence()
    persistence.id = clearing.id
    persistence.bondContractId = clearing.bondContractId
    persistence.holderAccountId = clearing.holderAccountId
    persistence.partition = clearing.partition
    persistence.amount = clearing.amount
    persistence.expirationDate = clearing.expirationDate
    persistence.status = clearing.status
    persistence.toAccountId = clearing.toAccountId
    persistence.data = clearing.data
    persistence.operatorData = clearing.operatorData
    persistence.operatorAccountId = clearing.operatorAccountId
    persistence.createdAt = clearing.createdAt
    persistence.updatedAt = clearing.updatedAt
    return persistence
  }

  async save(clearing: ClearingTransfer): Promise<ClearingTransfer> {
    const persistence = this.toPersistence(clearing)
    const saved = await this.repository.save(persistence)
    return this.toDomain(saved)
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingTransfer | null> {
    const persistence = await this.repository.findOne({
      where: { bondContractId, holderAccountId, id: clearingId },
    })
    return persistence ? this.toDomain(persistence) : null
  }

  async findAllByHolder(
    bondContractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<ClearingTransfer>> {
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

  async update(clearing: ClearingTransfer): Promise<ClearingTransfer> {
    const persistence = this.toPersistence(clearing)
    const updated = await this.repository.save(persistence)
    return this.toDomain(updated)
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
