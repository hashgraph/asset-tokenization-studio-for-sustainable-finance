// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class BondImpactData extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  operator: string

  @IsNotEmpty()
  @IsNumberString()
  maxDeviationCap: string

  @IsNotEmpty()
  @IsNumberString()
  baseLine: string

  @IsNotEmpty()
  @IsNumberString()
  maxDeviationFloor: string

  @IsNotEmpty()
  @IsNumberString()
  impactDataDecimals: string

  @IsNotEmpty()
  @IsNumberString()
  adjustmentPrecision: string
}
