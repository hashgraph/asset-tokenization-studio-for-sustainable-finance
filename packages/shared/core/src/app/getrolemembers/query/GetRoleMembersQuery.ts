// SPDX-License-Identifier: Apache-2.0

import { Query } from "../../../query/Query"
import { QueryPageOptions } from "@query/QueryPageOptions"
import { QueryPageResponse } from "@query/QueryPageResponse"
import { RoleMemberQueryResponse } from "./RoleMemberQueryResponse"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class GetRoleMembersQuery extends Query<QueryPageResponse<RoleMemberQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  readonly roleId: string

  @IsString()
  @IsNotEmpty()
  readonly contractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(roleId: string, contractId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.roleId = roleId
    this.contractId = contractId
    this.pageOptions = pageOptions
  }
}
