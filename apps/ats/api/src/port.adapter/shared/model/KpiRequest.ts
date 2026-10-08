// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber, IsString, Min, Max, ValidateNested } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class InterestRateRequest {
  @ApiProperty({
    description: "Maximum interest rate (with decimals, e.g., 500 = 5% with 2 decimals)",
    example: "500",
  })
  @IsString()
  @IsNotEmpty()
  maxRate: string

  @ApiProperty({
    description: "Base interest rate (with decimals, e.g., 300 = 3% with 2 decimals)",
    example: "300",
  })
  @IsString()
  @IsNotEmpty()
  baseRate: string

  @ApiProperty({
    description: "Minimum interest rate (with decimals, e.g., 100 = 1% with 2 decimals)",
    example: "100",
  })
  @IsString()
  @IsNotEmpty()
  minRate: string

  @ApiProperty({
    description: "Start period timestamp (Unix timestamp in seconds)",
    example: "1735689600",
  })
  @IsString()
  @IsNotEmpty()
  startPeriod: string

  @ApiProperty({
    description: "Starting interest rate (with decimals)",
    example: "300",
  })
  @IsString()
  @IsNotEmpty()
  startRate: string

  @ApiProperty({
    description: "Penalty for missed KPI targets (with decimals, e.g., 50 = 0.5% penalty)",
    example: "50",
  })
  @IsString()
  @IsNotEmpty()
  missedPenalty: string

  @ApiProperty({
    description: "Reporting period in seconds (e.g., 2592000 for 30 days)",
    example: "2592000",
  })
  @IsString()
  @IsNotEmpty()
  reportPeriod: string

  @ApiProperty({
    description: "Number of decimals for rate values",
    example: 2,
    minimum: 0,
    maximum: 18,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(18)
  rateDecimals: number
}

export class ImpactDataRequest {
  @ApiProperty({
    description: "Maximum deviation cap for KPI impact (with decimals, e.g., 1000 = 10% with 2 decimals)",
    example: "1000",
  })
  @IsString()
  @IsNotEmpty()
  maxDeviationCap: string

  @ApiProperty({
    description: "Baseline value for KPI measurement",
    example: "50000",
  })
  @IsString()
  @IsNotEmpty()
  baseLine: string

  @ApiProperty({
    description: "Maximum deviation floor for KPI impact (with decimals, e.g., 500 = 5% with 2 decimals)",
    example: "500",
  })
  @IsString()
  @IsNotEmpty()
  maxDeviationFloor: string

  @ApiProperty({
    description: "Number of decimals for impact data values",
    example: 2,
    minimum: 0,
    maximum: 18,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(18)
  impactDataDecimals: number

  @ApiProperty({
    description: "Precision for adjustment calculations (e.g., 10000 = 4 decimals precision)",
    example: "10000",
  })
  @IsString()
  @IsNotEmpty()
  adjustmentPrecision: string
}

export class KpiRequest {
  @ApiProperty({
    description: "Interest rate configuration for KPI-linked bonds",
    type: InterestRateRequest,
  })
  @ValidateNested()
  @Type(() => InterestRateRequest)
  @IsNotEmpty()
  interestRate: InterestRateRequest

  @ApiProperty({
    description: "Impact data for KPI measurement and rate adjustments",
    type: ImpactDataRequest,
  })
  @ValidateNested()
  @Type(() => ImpactDataRequest)
  @IsNotEmpty()
  impactData: ImpactDataRequest
}
