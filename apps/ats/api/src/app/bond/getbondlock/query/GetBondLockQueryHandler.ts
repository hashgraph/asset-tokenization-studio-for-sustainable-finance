// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondLockRepository } from "@domain/bond/lock/repository/BondLockRepository"
import { GetBondLockQuery } from "./GetBondLockQuery"
import { BondLockQueryResponse } from "./BondLockQueryResponse"
import { BondLockNotFoundError } from "@domain/bond/lock/errors/BondLockNotFoundError"

@Singleton()
@Handler(GetBondLockQuery)
export class GetBondLockQueryHandler implements QueryHandler<GetBondLockQuery, BondLockQueryResponse> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondLockRepository: BondLockRepository,
  ) {}

  @Validate()
  async execute(query: GetBondLockQuery): Promise<BondLockQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const lock = await this.bondLockRepository.findByBondContractIdAndHolderAccountIdAndId(
      query.bondContractId,
      query.holderAccountId,
      query.lockId,
    )

    if (!lock) {
      throw BondLockNotFoundError.lockIdError(query.bondContractId, query.lockId)
    }

    return {
      id: lock.id,
      contractId: lock.contractId,
      holderAccountId: lock.holderAccountId,
      partition: lock.partition,
      amount: lock.amount,
      expirationTimestamp: lock.expirationTimestamp,
      operatorAccountId: lock.operatorAccountId,
      createdAt: lock.createdAt,
      updatedAt: lock.updatedAt,
    }
  }
}
