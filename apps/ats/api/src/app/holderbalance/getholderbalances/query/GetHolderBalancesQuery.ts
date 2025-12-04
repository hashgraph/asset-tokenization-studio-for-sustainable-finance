// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { HolderBalancesQueryResponse } from "./HolderBalancesQueryResponse"

export class GetHolderBalancesQuery extends Query<QueryPageResponse<HolderBalancesQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @IsNotEmpty()
  @IsString()
  readonly holderAccountId: string

  constructor(
    bondContractId: string,
    holderAccountId: string,
    public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
  }
}
