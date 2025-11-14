// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/bond/holderbalance/model/BondHolderBalance"
import { BondHolderBalancePersistence } from "../model/BondHolderBalancePersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class BondHolderBalanceTypeOrmRepository implements BondHolderBalanceRepository {
  constructor(
    @InjectRepository(BondHolderBalancePersistence)
    private readonly repository: Repository<BondHolderBalancePersistence>,
  ) {}

  async save(bondHolderBalance: BondHolderBalance): Promise<BondHolderBalance> {
    return (await this.repository.save(
      bondHolderBalance as unknown as BondHolderBalancePersistence,
    )) as BondHolderBalance
  }

  async findByContractIdHolderAccountIdAndPartition(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
  ): Promise<BondHolderBalance | null> {
    return (await this.repository.findOne({
      where: { contractId: bondContractId, holderAccountId, partition },
    })) as BondHolderBalance | null
  }

  async findAllByContractIdPaginated(
    contractId: string,
    options: PageOptions,
  ): Promise<Page<BondHolderBalance>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
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
}
