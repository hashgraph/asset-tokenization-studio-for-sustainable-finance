// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { RoleMemberQueryResponse } from "./RoleMemberQueryResponse"
import { Type } from "class-transformer"

export class GetRoleMembersQuery extends Query<QueryPageResponse<RoleMemberQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  @IsNotEmpty()
  @IsString()
  readonly roleHex: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(marketContractId: string, roleHex: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.marketContractId = marketContractId
    this.roleHex = roleHex
    this.pageOptions = pageOptions
  }
}
