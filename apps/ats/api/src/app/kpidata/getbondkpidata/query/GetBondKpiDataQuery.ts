// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondKpiDataQueryResponse } from "./BondKpiDataQueryResponse"

export class GetBondKpiDataQuery extends Query<QueryPageResponse<BondKpiDataQueryResponse>> {
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
