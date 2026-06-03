// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondInterestRate } from "@domain/interestrate/model/BondInterestRate"
import { BondInterestRatePersistence } from "../model/BondInterestRatePersistence"
import type { BondInterestRateRepository } from "@domain/interestrate/repository/BondInterestRateRepository"

@Injectable()
export class BondInterestRateTypeOrmRepository implements BondInterestRateRepository {
  constructor(
    @InjectRepository(BondInterestRatePersistence)
    private readonly repository: Repository<BondInterestRatePersistence>,
  ) {}

  async save(interestRate: BondInterestRate): Promise<BondInterestRate> {
    const saved = await this.repository.save(interestRate as unknown as BondInterestRatePersistence)
    return saved as unknown as BondInterestRate
  }

  async findByContractId(bondContractId: string): Promise<BondInterestRate | null> {
    const result = await this.repository.findOne({ where: { bondContractId } })
    return result as unknown as BondInterestRate | null
  }
}
