// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { OfferingRepository } from "../repositories/OfferingRepository"
import { CreateOfferingDomainServiceRequest } from "./model/CreateOfferingDomainServiceRequest"
import { Offering } from "../model/Offering"
import { OfferingFoundError } from "../errors/OfferingFoundError"
import { OfferingStatus } from "@domain/shared/model/OfferingStatus"
import { CheckPrimaryMarketActiveDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketActiveDomainService"

@Singleton()
export class CreateOfferingDomainService {
  constructor(
    @Inject() private readonly offeringRepository: OfferingRepository,
    private readonly checkPrimaryMarketActiveDomainService: CheckPrimaryMarketActiveDomainService,
  ) {}

  async execute(createOfferingDomainServiceRequest: CreateOfferingDomainServiceRequest): Promise<Offering> {
    const market = await this.checkPrimaryMarketActiveDomainService.execute(createOfferingDomainServiceRequest.marketId)

    const existingOffering = await this.offeringRepository.findByOfferingId(
      createOfferingDomainServiceRequest.offeringId,
    )
    if (existingOffering) {
      throw OfferingFoundError.offeringIdError(createOfferingDomainServiceRequest.offeringId)
    }

    const offering = Object.assign(new Offering(), {
      offeringId: createOfferingDomainServiceRequest.offeringId,
      market: market,
      bondId: createOfferingDomainServiceRequest.bondId,
      status: OfferingStatus.CREATED,
      treasuryId: createOfferingDomainServiceRequest.treasuryId,
      paymentTokenId: createOfferingDomainServiceRequest.paymentTokenId,
      lotSize: createOfferingDomainServiceRequest.lotSize,
      minQuantity: createOfferingDomainServiceRequest.minQuantity,
      maxQuantity: createOfferingDomainServiceRequest.maxQuantity,
      targetQuantity: createOfferingDomainServiceRequest.targetQuantity,
      targetQuantityRule: createOfferingDomainServiceRequest.targetQuantityRule,
      startDate: createOfferingDomainServiceRequest.startDate,
      endDate: createOfferingDomainServiceRequest.endDate,
      deadlineRule: createOfferingDomainServiceRequest.deadlineRule,
    })
    return await this.offeringRepository.save(offering)
  }
}
