// SPDX-License-Identifier: Apache-2.0
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondInterestRate" })
export class BondInterestRateResponse {
  @ApiProperty({ description: "Interest rate record identifier", example: "uuid" })
  id: string

  @ApiProperty({ description: "Bond contract ID", example: "0.0.6823801" })
  bondContractId: string

  @ApiProperty({ description: "Operator EVM address", example: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7" })
  operator: string

  @ApiProperty({ description: "Maximum interest rate (with decimals)", example: "600" })
  maxRate: string

  @ApiProperty({ description: "Base interest rate (with decimals)", example: "400" })
  baseRate: string

  @ApiProperty({ description: "Minimum interest rate (with decimals)", example: "200" })
  minRate: string

  @ApiProperty({ description: "Start period (Unix timestamp, '0' if not set)", example: "0" })
  startPeriod: string

  @ApiProperty({ description: "Starting interest rate (with decimals)", example: "400" })
  startRate: string

  @ApiProperty({ description: "Penalty for missed KPI targets (with decimals)", example: "50" })
  missedPenalty: string

  @ApiProperty({ description: "Reporting period in seconds", example: "31536000" })
  reportPeriod: string

  @ApiProperty({ description: "Number of decimals for rate values", example: "2" })
  rateDecimals: string

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date
}
