// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondLocksQueryResponse } from "./BondLocksQueryResponse"

export class GetBondLocksQuery extends Query<QueryPageResponse<BondLocksQueryResponse>> {
  @IsNotEmpty()
  readonly bondContractId: string

  @IsNotEmpty()
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
