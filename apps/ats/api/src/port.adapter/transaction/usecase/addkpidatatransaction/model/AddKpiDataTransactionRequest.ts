// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AddKpiDataTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Unix timestamp in seconds (must be <= block.timestamp)",
    example: "1748908800",
  })
  @IsString()
  @IsNotEmpty()
  date: string

  @ApiProperty({
    description: "KPI value (uint256 as string)",
    example: "105",
  })
  @IsString()
  @IsNotEmpty()
  value: string

  @ApiProperty({
    description: "Project EVM address used as grouping key for KPI data points",
    example: "0xcdc1c3a95ec40007cf92e3db67617063a177f54c",
  })
  @IsString()
  @IsNotEmpty()
  projectAddress: string
}
