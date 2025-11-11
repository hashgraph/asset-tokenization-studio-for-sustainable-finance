// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query, QueryPageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondCouponsQueryResponse } from "./BondCouponsQueryResponse"

export class GetBondCouponsQuery extends Query<BondCouponsQueryResponse> {
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
