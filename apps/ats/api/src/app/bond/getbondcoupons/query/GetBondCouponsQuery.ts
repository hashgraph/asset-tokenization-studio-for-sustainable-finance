// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { GetBondCouponsQueryResponse } from "./GetBondCouponsQueryResponse"

export class GetBondCouponsQuery extends Query<GetBondCouponsQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  constructor(bondContractId: string) {
    super()
    this.bondContractId = bondContractId
  }
}
