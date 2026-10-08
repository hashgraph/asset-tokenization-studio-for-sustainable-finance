// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { OfferingQueryResponse } from "./OfferingQueryResponse"

export class GetOfferingQuery extends Query<OfferingQueryResponse> {
  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  constructor(marketContractId: string, offeringId: number) {
    super()
    this.marketContractId = marketContractId
    this.offeringId = offeringId
  }
}
