// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EnvironmentalAssetTokenTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTokenTransfer"
import { EnvironmentalAssetTokenTransferRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenTransferRepository"
import { EnvironmentalAssetTokenTransferPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTokenTransferPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class EnvironmentalAssetTokenTransferTypeOrmRepository implements EnvironmentalAssetTokenTransferRepository {
  constructor(
    @InjectRepository(EnvironmentalAssetTokenTransferPersistence)
    private readonly repository: Repository<EnvironmentalAssetTokenTransferPersistence>,
  ) {}

  async save(transfer: EnvironmentalAssetTokenTransfer): Promise<EnvironmentalAssetTokenTransfer> {
    const saved = await this.repository.save(transfer)
    return this.toDomain(saved)
  }

  async findById(id: string): Promise<EnvironmentalAssetTokenTransfer | null> {
    const persistence = await this.repository.findOne({ where: { id } })
    return persistence ? this.toDomain(persistence) : null
  }

  async findByEnvironmentalAssetTokenId(
    environmentalAssetTokenId: string,
    options: PageOptions,
  ): Promise<Page<EnvironmentalAssetTokenTransfer>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistenceList, total] = await this.repository.findAndCount({
      where: { environmentalAssetTokenId },
      order: { [options.order.orderBy]: orderDirection },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    })

    const items = persistenceList.map((persistence) => this.toDomain(persistence))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async findByAccountId(accountId: string, options: PageOptions): Promise<Page<EnvironmentalAssetTokenTransfer>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistenceList, total] = await this.repository.findAndCount({
      where: { accountId },
      order: { [options.order.orderBy]: orderDirection },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    })

    const items = persistenceList.map((persistence) => this.toDomain(persistence))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  private toDomain(persistence: EnvironmentalAssetTokenTransferPersistence): EnvironmentalAssetTokenTransfer {
    return { ...persistence } as EnvironmentalAssetTokenTransfer
  }
}
