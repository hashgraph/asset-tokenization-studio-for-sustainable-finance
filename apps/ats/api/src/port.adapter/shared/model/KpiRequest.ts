// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class KpiRequest {
  @ApiProperty({
    description: "EVM address of the KPI administrator with rights to manage key performance indicators",
    example: "0x1234567890123456789012345678901234567890",
  })
  @IsString()
  @IsNotEmpty()
  adminAddress: string

  @ApiProperty({
    description: "EVM address of the KPI contract owner",
    example: "0x6789012345678901234567890123456789012345",
  })
  @IsString()
  @IsNotEmpty()
  ownerAccountAddress: string
}
