// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber, IsString, Min, Max, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class InterestRateAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  maxRate: string

  @IsString()
  @IsNotEmpty()
  baseRate: string

  @IsString()
  @IsNotEmpty()
  minRate: string

  @IsString()
  @IsNotEmpty()
  startPeriod: string

  @IsString()
  @IsNotEmpty()
  startRate: string

  @IsString()
  @IsNotEmpty()
  missedPenalty: string

  @IsString()
  @IsNotEmpty()
  reportPeriod: string

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(18)
  rateDecimals: number
}

export class ImpactDataAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  maxDeviationCap: string

  @IsString()
  @IsNotEmpty()
  baseLine: string

  @IsString()
  @IsNotEmpty()
  maxDeviationFloor: string

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(18)
  impactDataDecimals: number

  @IsString()
  @IsNotEmpty()
  adjustmentPrecision: string
}

export class KpiAppServiceRequest {
  @ValidateNested()
  @Type(() => InterestRateAppServiceRequest)
  @IsNotEmpty()
  interestRate: InterestRateAppServiceRequest

  @ValidateNested()
  @Type(() => ImpactDataAppServiceRequest)
  @IsNotEmpty()
  impactData: ImpactDataAppServiceRequest
}
