// SPDX-License-Identifier: Apache-2.0
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondKpiDataItemDetail" })
export class BondKpiDataItemResponse {
  @ApiProperty({ description: "KPI data point identifier", example: "uuid" })
  id: string

  @ApiProperty({ description: "Bond contract ID", example: "0.0.6823801" })
  bondContractId: string

  @ApiProperty({ description: "Project EVM address", example: "0xcdc1c3a9..." })
  project: string

  @ApiProperty({ description: "Unix timestamp of the KPI data point", example: "1748908800" })
  date: string

  @ApiProperty({ description: "KPI value (uint256 as string)", example: "105" })
  value: string

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date
}
