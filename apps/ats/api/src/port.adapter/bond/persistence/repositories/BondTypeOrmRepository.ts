import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondRepository } from "@domain/bond/repositories/BondRepository"
import { Bond } from "@domain/bond/model/Bond"
import { BondPersistence } from "../model/BondPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondTypeOrmRepository implements BondRepository {
  constructor(
    @InjectRepository(BondPersistence)
    private readonly repository: Repository<BondPersistence>,
  ) {}

  async save(bond: Bond): Promise<Bond> {
    return (await this.repository.save(bond as BondPersistence)) as Bond
  }

  async findByContractId(contractId: string): Promise<Bond | null> {
    return (await this.repository.findOne({ where: { contractId } })) as Bond | null
  }

  async findAll(options: PageOptions): Promise<Page<Bond>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as Bond)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }
}
