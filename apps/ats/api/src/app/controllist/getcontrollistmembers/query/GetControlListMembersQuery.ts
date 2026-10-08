// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { ControlListMembersQueryResponse } from "./ControlListMembersQueryResponse"

export class GetControlListMembersQuery extends Query<QueryPageResponse<ControlListMembersQueryResponse>> {
  @IsNotEmpty()
  readonly bondContractId: string

  constructor(
    bondContractId: string,
    public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.bondContractId = bondContractId
  }
}
