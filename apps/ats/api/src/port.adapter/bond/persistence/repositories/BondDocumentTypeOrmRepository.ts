// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondDocument } from "@domain/bond/document/model/BondDocument"
import { BondDocumentPersistence } from "../model/BondDocumentPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondDocumentRepository } from "@domain/bond/document/repository/BondDocumentRepository"

@Injectable()
export class BondDocumentTypeOrmRepository implements BondDocumentRepository {
  constructor(
    @InjectRepository(BondDocumentPersistence)
    private readonly repository: Repository<BondDocumentPersistence>,
  ) {}

  async save(bondDocument: BondDocument): Promise<BondDocument> {
    return (await this.repository.save(bondDocument as BondDocumentPersistence)) as BondDocument
  }

  async findByContractIdAndName(contractId: string, name: string): Promise<BondDocument | null> {
    return (await this.repository.findOne({ where: { contractId, name } })) as BondDocument | null
  }

  async findAll(options: PageOptions): Promise<Page<BondDocument>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondDocument)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async delete(bondDocument: BondDocument): Promise<void> {
    await this.repository.delete({ contractId: bondDocument.contractId, name: bondDocument.name })
  }
}
