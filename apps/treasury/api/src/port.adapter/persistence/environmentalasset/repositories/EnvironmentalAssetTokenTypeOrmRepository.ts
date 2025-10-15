// SPDX-License-Identifier: Apache-2.0

import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { EnvironmentalAssetToken } from "@domain/environmentalasset/model/EnvironmentalAssetToken"
import { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { EnvironmentalAssetTokenPersistence } from "../model/EnvironmentalAssetTokenPersistence"
import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class EnvironmentalAssetTokenTypeOrmRepository implements EnvironmentalAssetTokenRepository {
  constructor(
    @InjectRepository(EnvironmentalAssetTokenPersistence)
    private readonly repository: Repository<EnvironmentalAssetTokenPersistence>,
  ) {}

  @Validate()
  async save(token: EnvironmentalAssetToken): Promise<EnvironmentalAssetToken> {
    const savedPersistence = await this.repository.save(token)
    return this.toDomain(savedPersistence)
  }

  async findAllByEnvironmentalAssetId(
    environmentalAssetId: string,
    options: PageOptions,
  ): Promise<Page<EnvironmentalAssetToken>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.repository.findAndCount({
      where: { environmentalAssetId },
      order: { [options.order.orderBy]: orderDirection },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
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

  private toDomain(persistence: EnvironmentalAssetTokenPersistence): EnvironmentalAssetToken {
    return { ...persistence } as EnvironmentalAssetToken
  }
}
