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

  async save(clearing: ClearingTransfer): Promise<ClearingTransfer> {
    return (await this.repository.save(clearing as unknown as BondClearingTransferPersistence)) as ClearingTransfer
  }

  async findByContractIdHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    clearingId: number,
  ): Promise<ClearingTransfer | null> {
    const persistence = await this.repository.findOne({
      where: { bondContractId, holderAccountId, id: clearingId },
    })
    if (!persistence) return null
    return Object.assign(new ClearingTransfer(), persistence)
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

    const items = persistences.map((p) => Object.assign(new ClearingTransfer(), p))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async update(clearing: ClearingTransfer): Promise<ClearingTransfer> {
    return (await this.repository.save(clearing as unknown as BondClearingTransferPersistence)) as ClearingTransfer
  }

  async deleteByCompositeKey(bondContractId: string, holderAccountId: string, clearingId: number): Promise<void> {
    await this.repository.delete({ bondContractId, holderAccountId, id: clearingId })
  }
}
