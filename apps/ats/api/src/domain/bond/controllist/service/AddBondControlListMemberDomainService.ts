// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddBondControlListMemberDomainServiceRequest } from "./model/AddBondControlListMemberDomainServiceRequest"
import { BondControlListMember } from "@domain/bond/controllist/model/BondControlListMember"
import type { BondControlListMemberRepository } from "../repository/BondControlListMemberRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class AddBondControlListMemberDomainService {
  constructor(
    @Inject() private readonly bondControlListMemberRepository: BondControlListMemberRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: AddBondControlListMemberDomainServiceRequest): Promise<BondControlListMember> {
    await this.checkBondExistsDomainService.execute(request.contractId)

    const existingMember = await this.bondControlListMemberRepository.findByContractIdAndHolderId(
      request.contractId,
      request.holderId,
    )

    if (existingMember) {
      return existingMember
    }

    const member = Object.assign(new BondControlListMember(), {
      contractId: request.contractId,
      holderId: request.holderId,
    })
    return await this.bondControlListMemberRepository.save(member)
  }
}
