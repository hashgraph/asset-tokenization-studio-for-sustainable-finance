// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { BondHoldQueryResponse } from "./BondHoldQueryResponse"

export class GetBondHoldQuery extends Query<BondHoldQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @IsNotEmpty()
  @IsString()
  readonly holderAccountId: string

  @IsNotEmpty()
  @IsNumber()
  readonly holdId: number

  @IsNotEmpty()
  @IsString()
  readonly partition: string

  constructor(bondContractId: string, holderAccountId: string, holdId: number, partition: string) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.holdId = holdId
    this.partition = partition
  }
}
