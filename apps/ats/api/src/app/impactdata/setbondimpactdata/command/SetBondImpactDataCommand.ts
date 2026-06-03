// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class SetBondImpactDataCommand extends Command<void> {
  @IsNotEmpty() @IsString() bondContractId: string
  @IsNotEmpty() @IsString() operator: string
  @IsNotEmpty() @IsNumberString() maxDeviationCap: string
  @IsNotEmpty() @IsNumberString() baseLine: string
  @IsNotEmpty() @IsNumberString() maxDeviationFloor: string
  @IsNotEmpty() @IsNumberString() impactDataDecimals: string
  @IsNotEmpty() @IsNumberString() adjustmentPrecision: string

  constructor(
    bondContractId: string,
    operator: string,
    maxDeviationCap: string,
    baseLine: string,
    maxDeviationFloor: string,
    impactDataDecimals: string,
    adjustmentPrecision: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.operator = operator
    this.maxDeviationCap = maxDeviationCap
    this.baseLine = baseLine
    this.maxDeviationFloor = maxDeviationFloor
    this.impactDataDecimals = impactDataDecimals
    this.adjustmentPrecision = adjustmentPrecision
  }
}
