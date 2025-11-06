// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { OfferingRepository } from "../repositories/OfferingRepository"
import { CreateOfferingDomainServiceRequest } from "./model/CreateOfferingDomainServiceRequest"
import { Offering } from "../model/Offering"
import { OfferingFoundError } from "../errors/OfferingFoundError"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"

@Singleton()
export class CreateOfferingDomainService {
  constructor(
    @Inject() private readonly offeringRepository: OfferingRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(createOfferingDomainServiceRequest: CreateOfferingDomainServiceRequest): Promise<Offering> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      createOfferingDomainServiceRequest.marketContractId,
    )
    market.checkActive()

    const existingOffering = await this.offeringRepository.findByOfferingIdAndMarketId(
      createOfferingDomainServiceRequest.offeringId,
      market.id,
    )
    if (existingOffering) {
      throw OfferingFoundError.offeringIdAndMarketContractIdError(
        createOfferingDomainServiceRequest.offeringId,
        createOfferingDomainServiceRequest.marketContractId,
      )
    }

    const offering = Object.assign(new Offering(), {
      offeringId: createOfferingDomainServiceRequest.offeringId,
      market: market,
      bondContractId: createOfferingDomainServiceRequest.bondContractId,
      operatorId: createOfferingDomainServiceRequest.operatorId,
      treasuryContractId: createOfferingDomainServiceRequest.treasuryContractId,
      paymentTokenContractId: createOfferingDomainServiceRequest.paymentTokenContractId,
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
