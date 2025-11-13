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
import type { BondLockRepository } from "@domain/bond/lock/repository/BondLockRepository"
import { GetBondLocksQuery } from "./GetBondLocksQuery"
import { BondLocksQueryResponse } from "./BondLocksQueryResponse"
import { BondLock } from "@domain/bond/lock/model/BondLock"

@Singleton()
@Handler(GetBondLocksQuery)
export class GetBondLocksQueryHandler
  implements QueryHandler<GetBondLocksQuery, QueryPageResponse<BondLocksQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondLockRepository: BondLockRepository,
  ) {}

  @Validate()
  async execute(query: GetBondLocksQuery): Promise<QueryPageResponse<BondLocksQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondLockRepository.findByBondContractIdAndHolderAccountIdPaginated(
      query.bondContractId,
      query.holderAccountId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (lock: BondLock) => ({
      id: lock.id,
      contractId: lock.contractId,
      holderAccountId: lock.holderAccountId,
      partition: lock.partition,
      amount: lock.amount,
      expirationTimestamp: lock.expirationTimestamp,
      operatorAccountId: lock.operatorAccountId,
      createdAt: lock.createdAt,
      updatedAt: lock.updatedAt,
    }))
  }
}
