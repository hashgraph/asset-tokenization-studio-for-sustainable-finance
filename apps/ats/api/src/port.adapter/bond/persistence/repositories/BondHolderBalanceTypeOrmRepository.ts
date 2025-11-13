// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { BondHolderBalance } from "@domain/bond/holderbalance/model/BondHolderBalance"
import { BondHolderBalancePersistence } from "../model/BondHolderBalancePersistence"

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
}
