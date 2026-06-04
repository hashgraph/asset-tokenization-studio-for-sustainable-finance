// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { GetBondInterestRateQueryResponse } from "./GetBondInterestRateQueryResponse"

export class GetBondInterestRateQuery extends Query<GetBondInterestRateQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  constructor(bondContractId: string) {
    super()
    this.bondContractId = bondContractId
  }
}
