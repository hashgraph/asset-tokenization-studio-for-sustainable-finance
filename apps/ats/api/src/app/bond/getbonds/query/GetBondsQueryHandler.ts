// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import type { BondRepository } from "@domain/bond/repositories/BondRepository"
import { GetBondsQuery } from "./GetBondsQuery"
import { BondQueryResponse } from "./BondQueryResponse"
import { Bond } from "@domain/bond/model/Bond"

@Singleton()
@Handler(GetBondsQuery)
export class GetBondsQueryHandler implements QueryHandler<GetBondsQuery, QueryPageResponse<BondQueryResponse>> {
  constructor(@Inject("BondRepository") private readonly bondRepository: BondRepository) {}

  @Validate()
  async execute(query: GetBondsQuery): Promise<QueryPageResponse<BondQueryResponse>> {
    const page = await this.bondRepository.findAll(query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(page, (bond: Bond) => ({
      id: bond.id,
      contractId: bond.contractId,
      treasuryId: bond.treasuryId,
      kpiId: bond.kpiId,
      name: bond.name,
      symbol: bond.symbol,
      isin: bond.isin,
      decimals: bond.decimals,
      currency: bond.currency,
      nominalValue: bond.nominalValue,
      startingDate: bond.startingDate,
      maturityDate: bond.maturityDate,
      maxSupply: bond.maxSupply,
      isPaused: bond.isPaused,
    }))
  }
}
