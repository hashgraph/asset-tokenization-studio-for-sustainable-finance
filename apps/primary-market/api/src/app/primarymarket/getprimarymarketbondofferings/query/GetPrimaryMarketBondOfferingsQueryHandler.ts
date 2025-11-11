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
import type { BlockchainAdapterPort } from "@port/blockchain/BlockchainAdapterPort"

@Singleton()
@Handler(GetPrimaryMarketBondOfferingsQuery)
export class GetPrimaryMarketBondOfferingsQueryHandler
  implements QueryHandler<GetPrimaryMarketBondOfferingsQuery, QueryPageResponse<PrimaryMarketBondOfferingQueryResponse>>
{
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    @Inject() private readonly offeringRepository: OfferingRepository,
    @Inject("BlockchainAdapterPort")
    private readonly blockchainAdapter: BlockchainAdapterPort,
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

    const items = await Promise.all(
      offeringsPage.items.map(async (offering: Offering) => {
        const status = await this.blockchainAdapter.getOfferingStatus(market.contractId, offering.offeringDltId)

        return {
          offeringDltId: offering.offeringDltId,
          bondContractId: offering.bondContractId,
          operatorAccountId: offering.operatorAccountId,
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
          status,
          createdAt: offering.createdAt,
        }
      }),
    )

    const response = new QueryPageResponse<PrimaryMarketBondOfferingQueryResponse>()
    response.items = items
    response.total = offeringsPage.total
    response.page = offeringsPage.page
    response.limit = offeringsPage.limit
    response.totalPages = offeringsPage.totalPages

    return response
  }
}
