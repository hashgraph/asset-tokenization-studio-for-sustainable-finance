// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetOfferingsQuery } from "./GetOfferingsQuery"
import { OfferingQueryResponse } from "./OfferingQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { OfferingRepository } from "@domain/offering/repositories/OfferingRepository"
import type { Offering } from "@domain/offering/model/Offering"
import type { BlockchainAdapterPort } from "@port/blockchain/BlockchainAdapterPort"

@Singleton()
@Handler(GetOfferingsQuery)
export class GetOfferingsQueryHandler
  implements QueryHandler<GetOfferingsQuery, QueryPageResponse<OfferingQueryResponse>>
{
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    @Inject() private readonly offeringRepository: OfferingRepository,
    @Inject("BlockchainAdapterPort")
    private readonly blockchainAdapter: BlockchainAdapterPort,
  ) {}

  @Validate()
  async execute(query: GetOfferingsQuery): Promise<QueryPageResponse<OfferingQueryResponse>> {
    const { marketContractId, pageOptions } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)

    const offeringsPage = await this.offeringRepository.findByMarketId(market.id, pageOptions.toPageOptions())

    const items = await Promise.all(
      offeringsPage.items.map(async (offering: Offering) => {
        const status = await this.blockchainAdapter.getOfferingStatus(market.contractId, offering.id)

        return {
          id: offering.id,
          bondContractId: offering.bondContractId,
          operatorAccountId: offering.operatorAccountId,
          treasuryContractId: offering.treasuryContractId,
          paymentTokenContractId: offering.paymentTokenContractId,
          lotSize: offering.lotSize,
          minLots: offering.minLots,
          maxLots: offering.maxLots,
          targetLots: offering.targetLots,
          targetQuantityRule: offering.targetQuantityRule,
          startDate: offering.startDate,
          endDate: offering.endDate,
          deadlineRule: offering.deadlineRule,
          price: offering.price,
          priceDecimals: offering.priceDecimals,
          status,
          createdAt: offering.createdAt,
        }
      }),
    )

    const response = new QueryPageResponse<OfferingQueryResponse>()
    response.items = items
    response.total = offeringsPage.total
    response.page = offeringsPage.page
    response.limit = offeringsPage.limit
    response.totalPages = offeringsPage.totalPages

    return response
  }
}
