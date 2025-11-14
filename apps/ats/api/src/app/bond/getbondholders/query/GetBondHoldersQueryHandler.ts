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
import { GetBondHoldersQuery } from "./GetBondHoldersQuery"
import { BondHoldersQueryResponse } from "./BondHoldersQueryResponse"
import { BondHolderBalance } from "@domain/bond/holderbalance/model/BondHolderBalance"

@Singleton()
@Handler(GetBondHoldersQuery)
export class GetBondHoldersQueryHandler
  implements QueryHandler<GetBondHoldersQuery, QueryPageResponse<BondHoldersQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondHolderBalanceRepository: BondHolderBalanceRepository,
  ) {}

  @Validate()
  async execute(query: GetBondHoldersQuery): Promise<QueryPageResponse<BondHoldersQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondHolderBalanceRepository.findAllByContractIdPaginated(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (holder: BondHolderBalance) => ({
      id: holder.id,
      contractId: holder.contractId,
      holderAccountId: holder.holderAccountId,
      partition: holder.partition,
      availableBalance: holder.availableBalance,
      lockedBalance: holder.lockedBalance,
    }))
  }
}
