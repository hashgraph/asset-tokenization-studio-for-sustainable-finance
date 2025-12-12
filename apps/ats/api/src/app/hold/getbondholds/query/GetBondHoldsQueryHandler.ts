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
import type { BondHoldRepository } from "@domain/hold/repository/BondHoldRepository"
import { GetBondHoldsQuery } from "./GetBondHoldsQuery"
import { BondHoldsQueryResponse } from "./BondHoldsQueryResponse"
import { BondHold } from "@domain/hold/model/BondHold"

@Singleton()
@Handler(GetBondHoldsQuery)
export class GetBondHoldsQueryHandler
  implements QueryHandler<GetBondHoldsQuery, QueryPageResponse<BondHoldsQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondHoldRepository: BondHoldRepository,
  ) {}

  @Validate()
  async execute(query: GetBondHoldsQuery): Promise<QueryPageResponse<BondHoldsQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondHoldRepository.findByContractIdAndHolderPaginated(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (hold: BondHold) => ({
      id: hold.id,
      bondContractId: hold.bondContractId,
      holderAccountId: hold.holderAccountId,
      partition: hold.partition,
      amount: hold.amount,
      expirationTimestamp: hold.expirationTimestamp,
      escrowAccountId: hold.escrowAccountId,
      toAccountId: hold.toAccountId,
      data: hold.data,
      operatorData: hold.operatorData,
      operatorAccountId: hold.operatorAccountId,
      createdAt: hold.createdAt,
      updatedAt: hold.updatedAt,
    }))
  }
}
