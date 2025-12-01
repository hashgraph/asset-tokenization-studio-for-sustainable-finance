// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondHoldRepository } from "@domain/bond/hold/repository/BondHoldRepository"
import { GetBondHoldQuery } from "./GetBondHoldQuery"
import { BondHoldQueryResponse } from "./BondHoldQueryResponse"
import { BondHoldNotFoundError } from "@domain/bond/hold/errors/BondHoldNotFoundError"

@Singleton()
@Handler(GetBondHoldQuery)
export class GetBondHoldQueryHandler implements QueryHandler<GetBondHoldQuery, BondHoldQueryResponse> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondHoldRepository: BondHoldRepository,
  ) {}

  @Validate()
  async execute(query: GetBondHoldQuery): Promise<BondHoldQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const hold = await this.bondHoldRepository.findByContractIdAndHolderAndHoldId(
      query.bondContractId,
      query.holderAccountId,
      query.holdId,
      query.partition,
    )

    if (!hold) {
      throw BondHoldNotFoundError.withId(query.bondContractId, query.holderAccountId, query.holdId)
    }

    return {
      id: hold.id,
      contractId: hold.contractId,
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
    }
  }
}
