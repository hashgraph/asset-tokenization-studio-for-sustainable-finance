import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondRepository } from "@domain/bond/repositories/BondRepository"
import { Bond } from "@domain/bond/model/Bond"
import { BondPersistence } from "../model/BondPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { plainToInstance } from "class-transformer"

@Injectable()
export class BondTypeOrmRepository implements BondRepository {
  constructor(
    @InjectRepository(BondPersistence)
    private readonly repository: Repository<BondPersistence>,
  ) {}

  async save(bond: Bond): Promise<Bond> {
    const persistence = await this.repository.save(bond as BondPersistence)
    return this.toDomain(persistence)!
  }

  async findByContractId(contractId: string): Promise<Bond | null> {
    const persistence = await this.repository.findOne({ where: { contractId } })
    return this.toDomain(persistence)
  }

  async findAll(options: PageOptions): Promise<Page<Bond>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => this.toDomain(p)!)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  private toDomain(persistence: BondPersistence | null): Bond | null {
    return persistence ? plainToInstance(Bond, persistence) : null
  }
}
