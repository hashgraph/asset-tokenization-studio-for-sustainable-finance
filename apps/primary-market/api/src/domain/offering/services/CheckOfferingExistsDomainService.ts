// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { OfferingRepository } from "../repositories/OfferingRepository"
import { Offering } from "../model/Offering"
import { OfferingNotFoundError } from "../errors/OfferingNotFoundError"

@Singleton()
export class CheckOfferingExistsDomainService {
  constructor(@Inject() private readonly offeringRepository: OfferingRepository) {}

  async execute(offeringId: string): Promise<Offering> {
    const offering = await this.offeringRepository.findByOfferingId(offeringId)
    if (!offering) {
      throw OfferingNotFoundError.offeringIdError(offeringId)
    }
    return offering
  }
}
