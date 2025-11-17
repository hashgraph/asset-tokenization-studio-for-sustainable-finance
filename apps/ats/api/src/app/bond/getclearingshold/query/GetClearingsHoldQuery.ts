// SPDX-License-Identifier: Apache-2.0
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { ClearingHoldQueryResponse } from "./ClearingHoldQueryResponse"

export class GetClearingsHoldQuery extends Query<QueryPageResponse<ClearingHoldQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

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
