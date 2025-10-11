// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate } from '@hashgraph/green-bonds-shared-core'
import { CheckBondExistsDomainService } from '@domain/bond/services/CheckBondExistsDomainService'
import { GetBondQuery } from './GetBondQuery'
import { GetBondQueryResponse } from './GetBondQueryResponse'

@Singleton()
@Handler(GetBondQuery)
export class GetBondQueryHandler implements QueryHandler<GetBondQuery, GetBondQueryResponse> {
  constructor(private readonly checkBondExistsDomainService: CheckBondExistsDomainService) {}

  @Validate()
  async execute(query: GetBondQuery): Promise<GetBondQueryResponse> {
    const bond = await this.checkBondExistsDomainService.execute(query.bondContractId)
    return {
      id: bond.id,
      contractId: bond.contractId,
      treasuryId: bond.treasuryId,
      kpiId: bond.kpiId,
      name: bond.name,
      symbol: bond.symbol,
      decimals: bond.decimals,
      currency: bond.currency,
      nominalValue: bond.nominalValue,
      startingDate: bond.startingDate,
      maturityDate: bond.maturityDate,
      maxSupply: bond.maxSupply,
      isin: bond.isin,
    }
  }
}
