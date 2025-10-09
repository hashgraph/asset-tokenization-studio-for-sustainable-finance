// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { Treasury } from "@domain/treasury/model/Treasury"
import { plainToInstance } from "class-transformer"

@Singleton()
export class TreasuryTypeOrmRepository implements TreasuryRepository {
  constructor(
    @InjectRepository(TreasuryPersistence)
    private readonly treasuryRepository: Repository<TreasuryPersistence>,
  ) {}

  @Validate()
  async save(treasury: Treasury): Promise<Treasury> {
    const persistence = await this.treasuryRepository.save(treasury as TreasuryPersistence)
    return persistence as Treasury
  }

  async findByContractId(contractId: string): Promise<Treasury | null> {
    return this.toDomain(await this.treasuryRepository.findOneBy({ contractId }))
  }

  async findByBondContractId(bondContractId: string): Promise<Treasury | null> {
    return this.toDomain(await this.treasuryRepository.findOneBy({ bondContractId }))
  }

  private toDomain(persistence: TreasuryPersistence | null): Treasury | null {
    return persistence ? plainToInstance(Treasury, persistence) : null
  }
}
