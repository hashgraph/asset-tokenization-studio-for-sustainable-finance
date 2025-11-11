// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
  type UserRoleRepository,
  UserRole
} from "@hashgraph/green-bonds-shared-core"
import { GetUserRolesQuery } from "./GetUserRolesQuery"
import { UserRoleQueryResponse } from "./UserRoleQueryResponse"

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
