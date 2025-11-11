// SPDX-License-Identifier: Apache-2.0

import { Query } from "@query/Query"
import { QueryPageOptions } from "@query/QueryPageOptions"
import { QueryPageResponse } from "@query/QueryPageResponse"
import { UserRoleQueryResponse2 } from "./UserRoleQueryResponse2"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class GetUserRolesQuery2 extends Query<QueryPageResponse<UserRoleQueryResponse2>> {
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
