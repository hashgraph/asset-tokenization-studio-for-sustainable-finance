// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetRoleMembersQuery } from "./GetRoleMembersQuery"
import { RoleMemberQueryResponse } from "./RoleMemberQueryResponse"
import type { UserMarketRoleRepository } from "@domain/usermarketrole/repositories/UserMarketRepository"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckRoleExistsDomainService } from "@domain/role/services/CheckRoleExistsDomainService"
import { UserMarketRole } from "@domain/usermarketrole/model/UserMarketRole"

@Singleton()
@Handler(GetRoleMembersQuery)
export class GetRoleMembersQueryHandler
  implements QueryHandler<GetRoleMembersQuery, QueryPageResponse<RoleMemberQueryResponse>>
{
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkRoleExistsDomainService: CheckRoleExistsDomainService,
    @Inject() private readonly userMarketRoleRepository: UserMarketRoleRepository,
  ) {}

  @Validate()
  async execute(query: GetRoleMembersQuery): Promise<QueryPageResponse<RoleMemberQueryResponse>> {
    const { marketContractId, roleHex, pageOptions } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    const role = await this.checkRoleExistsDomainService.execute(roleHex)

    const roleMembersPage = await this.userMarketRoleRepository.findByMarketIdAndRoleId(
      market.id,
      role.id,
      pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(roleMembersPage, (userMarketRole: UserMarketRole) => ({
      accountId: userMarketRole.user.accountId,
    }))
  }
}
