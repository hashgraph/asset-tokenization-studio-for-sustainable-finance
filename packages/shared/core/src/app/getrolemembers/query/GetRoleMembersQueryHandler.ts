// SPDX-License-Identifier: Apache-2.0

import { Handler } from "@decorators/Handler"
import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { Validate } from "@decorators/Validate"
import { QueryHandler } from "@query/QueryHandler"
import { QueryPageResponse } from "@query/QueryPageResponse"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { GetRoleMembersQuery } from "./GetRoleMembersQuery"
import { RoleMemberQueryResponse } from "./RoleMemberQueryResponse"
import { UserRole } from "@domain/userrole/model/UserRole"

@Singleton()
@Handler(GetRoleMembersQuery)
export class GetRoleMembersQueryHandler
  implements QueryHandler<GetRoleMembersQuery, QueryPageResponse<RoleMemberQueryResponse>>
{
  constructor(@Inject() private readonly userRoleRepository: UserRoleRepository) {}

  @Validate()
  async execute(query: GetRoleMembersQuery): Promise<QueryPageResponse<RoleMemberQueryResponse>> {
    const userRolesPage = await this.userRoleRepository.findAllByRoleIdAndContractId(query.roleId, query.contractId, query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(userRolesPage, (userRole: UserRole) => ({
      userAccountId: userRole.userAccountId
    }))
  }
}
