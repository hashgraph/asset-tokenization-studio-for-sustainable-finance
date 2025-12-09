// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class TreasuryRequest {
  @ApiProperty({
    description: "EVM address of the diamond resolver contract for the treasury",
    example: "0x8901234567890123456789012345678901234567",
  })
  @IsString()
  @IsNotEmpty()
  resolverAddress: string

  @ApiProperty({
    description: "Configuration version number for the treasury diamond pattern",
    example: 1,
  })
  @IsNumber()
  configVersion: number

  @ApiProperty({
    description: "EVM address of the payment token contract (stablecoin or currency token)",
    example: "0x9012345678901234567890123456789012345678",
  })
  @IsString()
  @IsNotEmpty()
  paymentTokenAddress: string

  @ApiProperty({
    description: "EVM address of the treasury owner",
    example: "0x5432109876543210987654321098765432109876",
  })
  @IsString()
  @IsNotEmpty()
  ownerAccountAddress: string

  @ApiProperty({
    description: "Array of EVM addresses for environmental asset tokens linked to this treasury",
    example: ["0x0123456789012345678901234567890123456789"],
    type: [String],
  })
  @IsString({ each: true })
  environmentalAssetsAddresses: string[]
}
