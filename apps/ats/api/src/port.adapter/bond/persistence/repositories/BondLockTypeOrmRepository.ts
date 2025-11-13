import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondLockRepository } from "@domain/bond/lock/repository/BondLockRepository"
import { BondLock } from "@domain/bond/lock/model/BondLock"
import { BondLockPersistence } from "../model/BondLockPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondLockTypeOrmRepository implements BondLockRepository {
  constructor(
    @InjectRepository(BondLockPersistence)
    private readonly repository: Repository<BondLockPersistence>,
  ) {}

  async save(bondLock: BondLock): Promise<BondLock> {
    return (await this.repository.save(bondLock as unknown as BondLockPersistence)) as BondLock
  }

  async findByBondContractIdAndId(bondContractId: string, id: number): Promise<BondLock | null> {
    return (await this.repository.findOne({
      where: { contractId: bondContractId, id },
    })) as BondLock | null
  }

  async findByBondContractIdAndHolderAccountIdPaginated(
    bondContractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<BondLock>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      where: { contractId: bondContractId, holderAccountId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondLock)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async findByBondContractIdAndHolderAccountIdAndId(
    bondContractId: string,
    holderAccountId: string,
    id: number,
  ): Promise<BondLock | null> {
    return (await this.repository.findOne({
      where: { contractId: bondContractId, holderAccountId, id },
    })) as BondLock | null
  }

  async delete(bondContractId: string, id: number): Promise<void> {
    await this.repository.delete({ contractId: bondContractId, id })
  }
}
