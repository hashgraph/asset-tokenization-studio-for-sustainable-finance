// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetOfferingQuery } from "./GetOfferingQuery"
import { OfferingQueryResponse } from "./OfferingQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"

@Singleton()
@Handler(GetOfferingQuery)
export class GetOfferingQueryHandler implements QueryHandler<GetOfferingQuery, OfferingQueryResponse> {
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetOfferingQuery): Promise<OfferingQueryResponse> {
    const { marketContractId, offeringDltId } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    const offering = await this.checkOfferingExistsDomainService.execute(offeringDltId, market)

    return Object.assign(new OfferingQueryResponse(), {
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
      createdAt: offering.createdAt,
    })
  }
}
