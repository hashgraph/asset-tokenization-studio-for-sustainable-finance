// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumber } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { BondLockQueryResponse } from "./BondLockQueryResponse"

export class GetBondLockQuery extends Query<BondLockQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  @IsNotEmpty()
  readonly holderAccountId: string

  @IsNumber()
  @IsNotEmpty()
  readonly lockId: number

  constructor(bondContractId: string, holderAccountId: string, lockId: number) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.lockId = lockId
  }
}
