// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DeleteBondControlListMemberDomainServiceRequest } from "./model/DeleteBondControlListMemberDomainServiceRequest"
import { BondControlListMember } from "@domain/bond/controllist/model/BondControlListMember"
import type { BondControlListMemberRepository } from "../repository/BondControlListMemberRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import { BondControlListMemberNotFoundError } from "@domain/bond/controllist/errors/BondControlListMemberNotFoundError"

@Singleton()
export class DeleteBondControlListMemberDomainService {
  constructor(
    @Inject() private readonly bondControlListMemberRepository: BondControlListMemberRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: DeleteBondControlListMemberDomainServiceRequest): Promise<BondControlListMember> {
    await this.checkBondExistsDomainService.execute(request.contractId)

    const existingMember = await this.bondControlListMemberRepository.findByContractIdAndHolderId(
      request.contractId,
      request.holderId,
    )

    if (!existingMember) {
      throw BondControlListMemberNotFoundError.contractIdAndHolderIdError(request.contractId, request.holderId)
    }

    await this.bondControlListMemberRepository.delete(existingMember)
    return existingMember
  }
}
