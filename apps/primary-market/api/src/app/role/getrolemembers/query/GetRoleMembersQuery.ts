// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { RoleMemberQueryResponse } from "./RoleMemberQueryResponse"
import { Type } from "class-transformer"

export class GetRoleMembersQuery extends Query<QueryPageResponse<RoleMemberQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketId: string

  @IsNotEmpty()
  @IsString()
  readonly roleId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketId: string, roleId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketId = marketId
    this.roleId = roleId
    this.pageOptions = pageOptions
  }
}
