// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemoveBondControlListMemberDomainServiceRequest } from "./model/RemoveBondControlListMemberDomainServiceRequest"
import { BondControlListMember } from "@domain/bond/controllist/model/BondControlListMember"
import type { BondControlListMemberRepository } from "../repository/BondControlListMemberRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import { BondControlListMemberNotFoundError } from "@domain/bond/controllist/errors/BondControlListMemberNotFoundError"

@Singleton()
export class RemoveBondControlListMemberDomainService {
  constructor(
    @Inject() private readonly bondControlListMemberRepository: BondControlListMemberRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: RemoveBondControlListMemberDomainServiceRequest): Promise<void> {
    await this.checkBondExistsDomainService.execute(request.contractId)

    const existingMember = await this.bondControlListMemberRepository.findByContractIdAndHolderAccountId(
      request.contractId,
      request.holderAccountId,
    )

    if (!existingMember) {
      throw BondControlListMemberNotFoundError.contractIdAndHolderAccountIdError(
        request.contractId,
        request.holderAccountId,
      )
    }

    await this.bondControlListMemberRepository.delete(existingMember)
  }
}
