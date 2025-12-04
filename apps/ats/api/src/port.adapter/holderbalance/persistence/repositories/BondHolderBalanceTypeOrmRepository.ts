// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { BondHolderBalanceRepository } from "@domain/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/holderbalance/model/BondHolderBalance"
import { BondHolderBalancePersistence } from "../model/BondHolderBalancePersistence"
import { BaseRepository } from "@hashgraph/green-bonds-shared-core"
import type { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondHolderBalanceTypeOrmRepository
  extends BaseRepository<BondHolderBalancePersistence>
  implements BondHolderBalanceRepository
{
  constructor() {
    super(BondHolderBalancePersistence)
  }

  async save(bondHolderBalance: BondHolderBalance, transactionId?: string): Promise<BondHolderBalance> {
    return (await this.getRepository(transactionId).save(
      bondHolderBalance as unknown as BondHolderBalancePersistence,
    )) as BondHolderBalance
  }

  async findByContractIdHolderAccountIdAndPartition(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
  ): Promise<BondHolderBalance | null> {
    return (await this.getRepository().findOne({
      where: { contractId: bondContractId, holderAccountId, partition },
    })) as BondHolderBalance | null
  }

  async findAllByContractIdPaginated(contractId: string, options: PageOptions): Promise<Page<BondHolderBalance>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.getRepository().findAndCount({
      where: { contractId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondHolderBalance)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async findAllByContractIdAndHolderAccountIdPaginated(
    contractId: string,
    holderAccountId: string,
    options: PageOptions,
  ): Promise<Page<BondHolderBalance>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.getRepository().findAndCount({
      where: { contractId, holderAccountId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondHolderBalance)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }
}
