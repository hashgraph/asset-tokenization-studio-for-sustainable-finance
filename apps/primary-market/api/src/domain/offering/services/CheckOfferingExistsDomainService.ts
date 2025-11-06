// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { OfferingRepository } from "../repositories/OfferingRepository"
import { Offering } from "../model/Offering"
import { OfferingNotFoundError } from "../errors/OfferingNotFoundError"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"

@Singleton()
export class CheckOfferingExistsDomainService {
  constructor(@Inject() private readonly offeringRepository: OfferingRepository) {}

  async execute(offeringDltId: string, market: PrimaryMarket): Promise<Offering> {
    const offering = await this.offeringRepository.findByOfferingDltIdAndMarketId(offeringDltId, market.id)
    if (!offering) {
      throw OfferingNotFoundError.offeringDltIdAndMarketContractIdError(offeringDltId, market.contractId)
    }
    return offering
  }
}
