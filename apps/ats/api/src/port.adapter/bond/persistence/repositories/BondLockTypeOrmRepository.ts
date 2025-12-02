import { Injectable } from "@nestjs/common"
import { BondLockRepository } from "@domain/bond/lock/repository/BondLockRepository"
import { BondLock } from "@domain/bond/lock/model/BondLock"
import { BondLockPersistence } from "../model/BondLockPersistence"
import { BaseRepository } from "@hashgraph/green-bonds-shared-core"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondLockTypeOrmRepository extends BaseRepository<BondLockPersistence> implements BondLockRepository {
  constructor() {
    super(BondLockPersistence)
  }

  async save(bondLock: BondLock, transactionId?: string): Promise<BondLock> {
    return (await this.getRepository(transactionId).save(bondLock as unknown as BondLockPersistence)) as BondLock
  }

  async findByBondContractIdAndId(bondContractId: string, id: number): Promise<BondLock | null> {
    return (await this.getRepository().findOne({
      where: { contractId: bondContractId, id },
    })) as BondLock | null
  }

  async findByBondContractIdAndHolderAccountIdPaginated(
    bondContractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<BondLock>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.getRepository().findAndCount({
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
    return (await this.getRepository().findOne({
      where: { contractId: bondContractId, holderAccountId, id },
    })) as BondLock | null
  }

  async delete(bondContractId: string, id: number): Promise<void> {
    await this.getRepository().delete({ contractId: bondContractId, id })
  }
}
