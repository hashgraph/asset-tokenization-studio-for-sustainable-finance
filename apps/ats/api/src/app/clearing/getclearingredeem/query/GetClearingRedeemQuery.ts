// SPDX-License-Identifier: Apache-2.0
import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { ClearingRedeemQueryResponse } from "./ClearingRedeemQueryResponse"

export class GetClearingRedeemQuery extends Query<ClearingRedeemQueryResponse> {
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
