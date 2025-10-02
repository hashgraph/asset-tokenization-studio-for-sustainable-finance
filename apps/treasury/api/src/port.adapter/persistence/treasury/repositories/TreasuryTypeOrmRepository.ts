// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { Treasury } from "@domain/treasury/model/Treasury"

@Singleton()
export class TreasuryTypeOrmRepository implements TreasuryRepository {
  constructor(
    @InjectRepository(TreasuryPersistence)
    private readonly beneficiaryRepository: Repository<TreasuryPersistence>,
  ) {}

  @Validate()
  async save(treasury: Treasury): Promise<Treasury> {
    const persistence = await this.beneficiaryRepository.save(treasury as TreasuryPersistence)
    return persistence as Treasury
  }

  async findByContractAddress(contractAddress: string): Promise<Treasury> {
    return (await this.beneficiaryRepository.findOneBy({ contractAddress })) as Treasury
  }
}
