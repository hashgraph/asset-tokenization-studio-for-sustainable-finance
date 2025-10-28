// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { InvestorRepository } from "@domain/investor/repositories/InvestorRepository"
import { Investor } from "@domain/investor/model/Investor"
import { InvestorPersistence } from "../model/InvestorPersistence"

@Injectable()
export class InvestorTypeORMRepository implements InvestorRepository {
  constructor(
    @InjectRepository(InvestorPersistence)
    private readonly repository: Repository<InvestorPersistence>,
  ) {}

  async save(investor: Investor): Promise<Investor> {
    const saved = await this.repository.save(investor as InvestorPersistence)
    return this.toDomain(saved)
  }

  async findByAccountId(accountId: string): Promise<Investor | null> {
    const persistence = await this.repository.findOne({
      where: { accountId },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: InvestorPersistence): Investor {
    return { ...persistence } as Investor
  }
}
