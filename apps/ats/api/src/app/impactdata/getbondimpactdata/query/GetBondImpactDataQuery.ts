// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { GetBondImpactDataQueryResponse } from "./GetBondImpactDataQueryResponse"

export class GetBondImpactDataQuery extends Query<GetBondImpactDataQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  constructor(bondContractId: string) {
    super()
    this.bondContractId = bondContractId
  }
}
