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
import type { BondControlListMemberRepository } from "@domain/controllist/repository/BondControlListMemberRepository"
import { GetControlListMembersQuery } from "./GetControlListMembersQuery"
import { ControlListMembersQueryResponse } from "./ControlListMembersQueryResponse"
import { BondControlListMember } from "@domain/controllist/model/BondControlListMember"

@Singleton()
@Handler(GetControlListMembersQuery)
export class GetControlListMembersQueryHandler
  implements QueryHandler<GetControlListMembersQuery, QueryPageResponse<ControlListMembersQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondControlListMemberRepository: BondControlListMemberRepository,
  ) {}

  @Validate()
  async execute(query: GetControlListMembersQuery): Promise<QueryPageResponse<ControlListMembersQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondControlListMemberRepository.findAllByContractId(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (member: BondControlListMember) => ({
      id: member.id,
      bondContractId: member.bondContractId,
      holderAccountId: member.holderAccountId,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }))
  }
}
