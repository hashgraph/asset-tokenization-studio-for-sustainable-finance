// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query, QueryPageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondDocumentsQueryResponse } from "./BondDocumentsQueryResponse"

export class GetBondDocumentsQuery extends Query<BondDocumentsQueryResponse> {
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
