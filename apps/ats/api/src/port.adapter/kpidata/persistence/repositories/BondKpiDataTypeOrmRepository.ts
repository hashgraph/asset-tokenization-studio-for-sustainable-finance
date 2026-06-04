// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondKpiData } from "@domain/kpidata/model/BondKpiData"
import { BondKpiDataPersistence } from "../model/BondKpiDataPersistence"
import type { BondKpiDataRepository } from "@domain/kpidata/repository/BondKpiDataRepository"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondKpiDataTypeOrmRepository implements BondKpiDataRepository {
  constructor(
    @InjectRepository(BondKpiDataPersistence)
    private readonly repository: Repository<BondKpiDataPersistence>,
  ) {}

  async save(kpiData: BondKpiData): Promise<BondKpiData> {
    const saved = await this.repository.save(kpiData as unknown as BondKpiDataPersistence)
    return saved as unknown as BondKpiData
  }

  async findAllByContractId(bondContractId: string, options: PageOptions): Promise<Page<BondKpiData>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      where: { bondContractId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    return {
      items: persistences.map((p) => p as unknown as BondKpiData),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async findByContractIdAndId(bondContractId: string, id: string): Promise<BondKpiData | null> {
    const result = await this.repository.findOne({ where: { bondContractId, id } })
    return result as unknown as BondKpiData | null
  }
}
