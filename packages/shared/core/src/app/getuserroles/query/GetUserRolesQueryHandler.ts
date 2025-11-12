// SPDX-License-Identifier: Apache-2.0

import { Handler } from "@decorators/Handler"
import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { Validate } from "@decorators/Validate"
import { QueryHandler } from "@query/QueryHandler"
import { QueryPageResponse } from "@query/QueryPageResponse"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { GetUserRolesQuery } from "./GetUserRolesQuery"
import { UserRoleQueryResponse } from "./UserRoleQueryResponse"
import { UserRole } from "@domain/userrole/model/UserRole"

@Singleton()
@Handler(GetUserRolesQuery)
export class GetUserRolesQueryHandler
  implements QueryHandler<GetUserRolesQuery, QueryPageResponse<UserRoleQueryResponse>>
{
  constructor(@Inject() private readonly userRoleRepository: UserRoleRepository) {}

  @Validate()
  async execute(query: GetUserRolesQuery): Promise<QueryPageResponse<UserRoleQueryResponse>> {
    const userRolesPage = await this.userRoleRepository.findAllByUserAccountIdAndContractId(query.userAccountId, query.contractId, query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(userRolesPage, (userRole: UserRole) => ({
      roleId: userRole.roleId
    }))
  }
}
