// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsArray, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { OfferingProcessResult } from "@domain/shared/model/OfferingProcessResult"

export class ExecuteOfferingCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsArray()
  processResults: OfferingProcessResult[]

  constructor(
    offeringId: number,
    marketContractId: string,
    operatorAccountId: string,
    processResults: OfferingProcessResult[],
  ) {
    super()
    this.offeringId = offeringId
    this.marketContractId = marketContractId
    this.operatorAccountId = operatorAccountId
    this.processResults = processResults
  }
}
