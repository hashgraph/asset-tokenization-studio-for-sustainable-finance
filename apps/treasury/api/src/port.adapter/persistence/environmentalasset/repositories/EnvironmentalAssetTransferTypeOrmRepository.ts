// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EnvironmentalAssetTransferRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTransferRepository"
import { EnvironmentalAssetTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTransfer"
import { EnvironmentalAssetTransferPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTransferPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class EnvironmentalAssetTransferTypeOrmRepository implements EnvironmentalAssetTransferRepository {
  constructor(
    @InjectRepository(EnvironmentalAssetTransferPersistence)
    private readonly repository: Repository<EnvironmentalAssetTransferPersistence>,
  ) {}

  async save(transfer: EnvironmentalAssetTransfer): Promise<EnvironmentalAssetTransfer> {
    const saved = await this.repository.save(transfer)
    return this.toDomain(saved)
  }

  async findByEnvironmentalAssetId(
    environmentalAssetId: string,
    options: PageOptions,
    type?: string,
  ): Promise<Page<EnvironmentalAssetTransfer>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const where: any = { environmentalAssetId }
    if (type) {
      where.type = type
    }

    const [persistenceList, total] = await this.repository.findAndCount({
      where,
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

  private toDomain(persistence: EnvironmentalAssetTransferPersistence): EnvironmentalAssetTransfer {
    return { ...persistence } as EnvironmentalAssetTransfer
  }
}
