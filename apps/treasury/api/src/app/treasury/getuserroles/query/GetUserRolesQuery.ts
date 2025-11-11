// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { UserRoleQueryResponse } from "./UserRoleQueryResponse"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class GetUserRolesQuery extends Query<QueryPageResponse<UserRoleQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  readonly userAccountId: string

  @IsString()
  @IsNotEmpty()
  readonly contractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(userAccountId: string, contractId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.userAccountId = userAccountId
    this.contractId = contractId
    this.pageOptions = pageOptions
  }
}
