// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate, Inject } from "@hashgraph/green-bonds-shared-core"
import { GetOfferingQuery } from "./GetOfferingQuery"
import { OfferingQueryResponse } from "./OfferingQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import type { BlockchainAdapterPort } from "@port/blockchain/BlockchainAdapterPort"

@Singleton()
@Handler(GetOfferingQuery)
export class GetOfferingQueryHandler implements QueryHandler<GetOfferingQuery, OfferingQueryResponse> {
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    @Inject("BlockchainAdapterPort")
    private readonly blockchainAdapter: BlockchainAdapterPort,
  ) {}

  @Validate()
  async execute(query: GetOfferingQuery): Promise<OfferingQueryResponse> {
    const { marketContractId, offeringId } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    const offering = await this.checkOfferingExistsDomainService.execute(offeringId, market)

    const status = await this.blockchainAdapter.getOfferingStatus(market.contractId, offering.id)

    return Object.assign(new OfferingQueryResponse(), {
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
    })
  }
}
