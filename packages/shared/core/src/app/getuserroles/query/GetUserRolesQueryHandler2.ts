// SPDX-License-Identifier: Apache-2.0

import { Handler } from "@decorators/Handler"
import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { Validate } from "@decorators/Validate"
import { QueryHandler } from "@query/QueryHandler"
import { QueryPageResponse } from "@query/QueryPageResponse"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { GetUserRolesQuery2 } from "./GetUserRolesQuery2"
import { UserRoleQueryResponse2 } from "./UserRoleQueryResponse2"
import { UserRole } from "@domain/userrole/model/UserRole"

@Singleton()
@Handler(GetUserRolesQuery2)
export class GetUserRolesQueryHandler2
  implements QueryHandler<GetUserRolesQuery2, QueryPageResponse<UserRoleQueryResponse2>>
{
  constructor(@Inject() private readonly userRoleRepository: UserRoleRepository) {}

  @Validate()
  async execute(query: GetUserRolesQuery2): Promise<QueryPageResponse<UserRoleQueryResponse2>> {
    const userRolesPage = await this.userRoleRepository.findAllByUserAccountIdAndContractId(query.userAccountId, query.contractId, query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(userRolesPage, (userRole: UserRole) => ({
      roleId: userRole.roleId
    }))
  }
}
