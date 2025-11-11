// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { OfferingQueryResponse } from "./OfferingQueryResponse"

export class GetOfferingQuery extends Query<OfferingQueryResponse> {
  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  constructor(marketContractId: string, offeringDltId: string) {
    super()
    this.marketContractId = marketContractId
    this.offeringDltId = offeringDltId
  }
}
