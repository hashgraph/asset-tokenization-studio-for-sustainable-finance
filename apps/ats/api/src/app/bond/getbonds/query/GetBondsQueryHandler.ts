// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { BondRepository } from "@domain/bond/repositories/BondRepository"
import { GetBondsQuery } from "./GetBondsQuery"
import { BondQueryResponse } from "./BondQueryResponse"

@Singleton()
@Handler(GetBondsQuery)
export class GetBondsQueryHandler implements QueryHandler<GetBondsQuery, BondQueryResponse> {
  constructor(@Inject("BondRepository") private readonly bondRepository: BondRepository) {}

  @Validate()
  async execute(query: GetBondsQuery): Promise<BondQueryResponse> {
    const domainPage = await this.bondRepository.findAll(query.pageOptions)
    return BondQueryResponse.fromDomainPage(domainPage)
  }
}
