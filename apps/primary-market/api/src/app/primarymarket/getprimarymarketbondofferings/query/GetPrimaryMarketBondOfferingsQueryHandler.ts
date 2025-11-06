// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketBondOfferingsQuery } from "./GetPrimaryMarketBondOfferingsQuery"
import { PrimaryMarketBondOfferingQueryResponse } from "./PrimaryMarketBondOfferingQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { OfferingRepository } from "@domain/offering/repositories/OfferingRepository"
import type { Offering } from "@domain/offering/model/Offering"

@Singleton()
@Handler(GetPrimaryMarketBondOfferingsQuery)
export class GetPrimaryMarketBondOfferingsQueryHandler
  implements QueryHandler<GetPrimaryMarketBondOfferingsQuery, QueryPageResponse<PrimaryMarketBondOfferingQueryResponse>>
{
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    @Inject() private readonly offeringRepository: OfferingRepository,
  ) {}

  @Validate()
  async execute(
    query: GetPrimaryMarketBondOfferingsQuery,
  ): Promise<QueryPageResponse<PrimaryMarketBondOfferingQueryResponse>> {
    const { marketContractId, bondContractId, pageOptions } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)

    const offeringsPage = await this.offeringRepository.findByMarketIdAndBondContractId(
      market.id,
      bondContractId,
      pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(offeringsPage, (offering: Offering) => ({
      offeringId: offering.offeringId,
      bondContractId: offering.bondContractId,
      operatorId: offering.operatorId,
      treasuryContractId: offering.treasuryContractId,
      paymentTokenContractId: offering.paymentTokenContractId,
      lotSize: offering.lotSize,
      minQuantity: offering.minQuantity,
      maxQuantity: offering.maxQuantity,
      targetQuantity: offering.targetQuantity,
      targetQuantityRule: offering.targetQuantityRule,
      startDate: offering.startDate,
      endDate: offering.endDate,
      deadlineRule: offering.deadlineRule,
    }))
  }
}
