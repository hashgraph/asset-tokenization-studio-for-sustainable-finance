// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { OfferingRepository } from "@domain/offering/repositories/OfferingRepository"
import { Offering } from "@domain/offering/model/Offering"
import { OfferingPersistence } from "../model/OfferingPersistence"
import { plainToInstance } from "class-transformer"

@Injectable()
export class OfferingTypeORMRepository implements OfferingRepository {
  constructor(
    @InjectRepository(OfferingPersistence)
    private readonly repository: Repository<OfferingPersistence>,
  ) {}

  async save(offering: Offering): Promise<Offering> {
    const saved = await this.repository.save(offering as unknown as OfferingPersistence)
    return this.toDomain(saved)
  }

  async findByOfferingIdAndMarketId(offeringId: string, marketId: string): Promise<Offering | null> {
    const persistence = await this.repository.findOne({
      where: {
        offeringId,
        market: { contractId: marketId },
      },
      relations: ["market"],
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: OfferingPersistence): Offering {
    return plainToInstance(Offering, persistence)
  }
}
