// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  Singleton,
  Validate,
  QueryPageResponse,
} from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondHolderBalanceRepository } from "@domain/bond/holderbalance/repository/BondHolderBalanceRepository"
import { GetHolderBalancesQuery } from "./GetHolderBalancesQuery"
import { HolderBalancesQueryResponse } from "./HolderBalancesQueryResponse"
import { BondHolderBalance } from "@domain/bond/holderbalance/model/BondHolderBalance"

@Singleton()
@Handler(GetHolderBalancesQuery)
export class GetHolderBalancesQueryHandler
  implements QueryHandler<GetHolderBalancesQuery, QueryPageResponse<HolderBalancesQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository,
  ) {}

  @Validate()
  async execute(query: GetHolderBalancesQuery): Promise<QueryPageResponse<HolderBalancesQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondHolderBalanceRepository.findAllByContractIdAndHolderAccountIdPaginated(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (balance: BondHolderBalance) => ({
      id: balance.id,
      contractId: balance.contractId,
      holderAccountId: balance.holderAccountId,
      partition: balance.partition,
      availableBalance: balance.availableBalance,
      lockedBalance: balance.lockedBalance,
      heldBalance: balance.heldBalance,
      clearingBalance: balance.clearingBalance,
    }))
  }
}
