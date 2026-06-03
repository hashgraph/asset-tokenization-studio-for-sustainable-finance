// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondImpactData } from "@domain/impactdata/model/BondImpactData"
import { BondImpactDataPersistence } from "../model/BondImpactDataPersistence"
import type { BondImpactDataRepository } from "@domain/impactdata/repository/BondImpactDataRepository"

@Injectable()
export class BondImpactDataTypeOrmRepository implements BondImpactDataRepository {
  constructor(
    @InjectRepository(BondImpactDataPersistence)
    private readonly repository: Repository<BondImpactDataPersistence>,
  ) {}

  async save(impactData: BondImpactData): Promise<BondImpactData> {
    const saved = await this.repository.save(impactData as unknown as BondImpactDataPersistence)
    return saved as unknown as BondImpactData
  }

  async findByContractId(bondContractId: string): Promise<BondImpactData | null> {
    const result = await this.repository.findOne({ where: { bondContractId } })
    return result as unknown as BondImpactData | null
  }
}
