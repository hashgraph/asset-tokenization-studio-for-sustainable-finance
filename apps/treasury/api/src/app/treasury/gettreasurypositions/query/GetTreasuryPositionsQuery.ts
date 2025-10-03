// SPDX-License-Identifier: Apache-2.0

import { IsHexadecimal, IsNotEmpty } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuryPositionsQueryResponse } from "@app/treasury/gettreasurypositions/query/GetTreasuryPositionsQueryResponse"

export class GetTreasuryPositionsQuery extends Query<GetTreasuryPositionsQueryResponse> {
  @IsNotEmpty()
  @IsHexadecimal()
  readonly bondContractAddress: string

  constructor(bondContractAddress: string) {
    super()
    this.bondContractAddress = bondContractAddress
  }
}
