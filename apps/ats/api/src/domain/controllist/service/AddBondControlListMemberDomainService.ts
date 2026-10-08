// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddBondControlListMemberDomainServiceRequest } from "./model/AddBondControlListMemberDomainServiceRequest"
import { BondControlListMember } from "@domain/controllist/model/BondControlListMember"
import type { BondControlListMemberRepository } from "../repository/BondControlListMemberRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import { BondControlListMemberFoundError } from "@domain/controllist/errors/BondControlListMemberFoundError"

@Singleton()
export class AddBondControlListMemberDomainService {
  constructor(
    @Inject() private readonly bondControlListMemberRepository: BondControlListMemberRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: AddBondControlListMemberDomainServiceRequest): Promise<BondControlListMember> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)

    const existingMember = await this.bondControlListMemberRepository.findByContractIdAndHolderAccountId(
      request.bondContractId,
      request.holderAccountId,
    )

    if (existingMember) {
      throw BondControlListMemberFoundError.contractIdAndHolderAccountIdError(
        request.bondContractId,
        request.holderAccountId,
      )
    }

    const member = Object.assign(new BondControlListMember(), {
      bondContractId: request.bondContractId,
      holderAccountId: request.holderAccountId,
    })
    return await this.bondControlListMemberRepository.save(member)
  }
}
