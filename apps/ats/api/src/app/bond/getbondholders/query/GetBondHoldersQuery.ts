// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondHoldersQueryResponse } from "./BondHoldersQueryResponse"

export class GetBondHoldersQuery extends Query<QueryPageResponse<BondHoldersQueryResponse>> {
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
