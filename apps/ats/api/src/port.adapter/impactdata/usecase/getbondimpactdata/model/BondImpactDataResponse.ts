// SPDX-License-Identifier: Apache-2.0
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondImpactData" })
export class BondImpactDataResponse {
  @ApiProperty({ description: "Impact data record identifier", example: "uuid" })
  id: string

  @ApiProperty({ description: "Bond contract ID", example: "0.0.6823801" })
  bondContractId: string

  @ApiProperty({ description: "Operator EVM address", example: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7" })
  operator: string

  @ApiProperty({ description: "Maximum deviation cap (with decimals)", example: "120" })
  maxDeviationCap: string

  @ApiProperty({ description: "Baseline value for KPI measurement", example: "100" })
  baseLine: string

  @ApiProperty({ description: "Maximum deviation floor (with decimals)", example: "80" })
  maxDeviationFloor: string

  @ApiProperty({ description: "Number of decimals for impact data values", example: "2" })
  impactDataDecimals: string

  @ApiProperty({ description: "Precision for adjustment calculations", example: "10000" })
  adjustmentPrecision: string

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date
}
