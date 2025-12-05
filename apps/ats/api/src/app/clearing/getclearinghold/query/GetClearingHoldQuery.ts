// SPDX-License-Identifier: Apache-2.0
import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { ClearingHoldQueryResponse } from "@app/clearing/getclearingshold/query/ClearingHoldQueryResponse"

export class GetClearingHoldQuery extends Query<ClearingHoldQueryResponse> {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsNumber()
  clearingId: number

  constructor(bondContractId: string, holderAccountId: string, clearingId: number) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.clearingId = clearingId
  }
}
