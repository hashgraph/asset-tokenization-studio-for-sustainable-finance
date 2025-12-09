// SPDX-License-Identifier: Apache-2.0

import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class FactoryRegulationRequest {
  @ApiProperty({
    description: "Primary regulation type identifier (e.g., RegD, RegS, RegA)",
    example: 1,
  })
  @IsNumber()
  regulationType: number

  @ApiProperty({
    description: "Sub-type identifier for the regulation (specific rule or exemption)",
    example: 1,
  })
  @IsNumber()
  regulationSubType: number

  @ApiProperty({
    description: "Whether the country control list operates as a whitelist (true) or blacklist (false)",
    example: true,
  })
  @IsBoolean()
  isCountryControlListWhiteList: boolean

  @ApiProperty({
    description: "Comma-separated list of ISO 3166-1 alpha-2 country codes",
    required: false,
    example: "US,GB,DE",
  })
  @IsOptional()
  @IsString()
  countries?: string

  @ApiProperty({
    description: "Additional regulatory information or notes",
    required: false,
    example: "RegD 506(c) compliant offering",
  })
  @IsOptional()
  @IsString()
  info?: string
}
