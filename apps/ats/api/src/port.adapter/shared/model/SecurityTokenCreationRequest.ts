// SPDX-License-Identifier: Apache-2.0

import { Type } from "class-transformer"
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SecurityTokenCreationRequest {
  @ApiProperty({
    description: "Name of the security token",
    example: "Green Bond 2024",
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: "Trading symbol for the security token",
    example: "GB24",
  })
  @IsString()
  @IsNotEmpty()
  symbol: string

  @ApiProperty({
    description: "International Securities Identification Number (ISIN)",
    example: "US1234567890",
  })
  @IsString()
  @IsNotEmpty()
  isin: string

  @ApiProperty({
    description: "Number of decimal places for token amounts",
    example: 2,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  decimals: number

  @ApiProperty({
    description: "Enable whitelist restriction for token holders",
    example: true,
  })
  @IsBoolean()
  isWhiteList: boolean

  @ApiProperty({
    description: "Enable ERC20Votes functionality for governance",
    example: false,
  })
  @IsBoolean()
  erc20VotesActivated: boolean

  @ApiProperty({
    description: "Enable controller functionality to force transfers",
    example: true,
  })
  @IsBoolean()
  isControllable: boolean

  @ApiProperty({
    description: "Protect token partitions from unauthorized operations",
    example: true,
  })
  @IsBoolean()
  arePartitionsProtected: boolean

  @ApiProperty({
    description: "Enable multi-partition functionality for token segregation",
    example: false,
  })
  @IsBoolean()
  isMultiPartition: boolean

  @ApiProperty({
    description: "Enable clearing functionality for two-phase transfers",
    example: true,
  })
  @IsBoolean()
  clearingActive: boolean

  @ApiProperty({
    description: "Enable internal KYC validation system",
    example: true,
  })
  @IsBoolean()
  internalKycActivated: boolean

  @ApiProperty({
    description: "Array of external contract addresses that can pause the token",
    required: false,
    example: ["0x1234567890123456789012345678901234567890"],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  externalPausesAddresses?: string[]

  @ApiProperty({
    description: "Array of external control list contract addresses for transfer restrictions",
    required: false,
    example: ["0x2345678901234567890123456789012345678901"],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  externalControlListsAddresses?: string[]

  @ApiProperty({
    description: "Array of external KYC list contract addresses for identity validation",
    required: false,
    example: ["0x3456789012345678901234567890123456789012"],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  externalKycListsAddresses?: string[]

  @ApiProperty({
    description: "EVM address of the diamond contract owner",
    required: false,
    example: "0x4567890123456789012345678901234567890123",
  })
  @IsOptional()
  @IsString()
  diamondOwnerAccountAddress?: string

  @ApiProperty({
    description: "EVM address of the compliance contract",
    required: false,
    example: "0x4567890123456789012345678901234567890123",
  })
  @IsOptional()
  @IsString()
  complianceAddress?: string

  @ApiProperty({
    description: "EVM address of the identity registry contract",
    required: false,
    example: "0x5678901234567890123456789012345678901234",
  })
  @IsOptional()
  @IsString()
  identityRegistryAddress?: string

  @ApiProperty({
    description: "ISO 4217 currency code for the bond",
    example: "USD",
  })
  @IsString()
  @IsNotEmpty()
  currency: string

  @ApiProperty({
    description: "Total number of bond units to be issued (as string to handle large numbers)",
    example: "1000000",
  })
  @IsNumberString()
  @IsNotEmpty()
  numberOfUnits: string

  @ApiProperty({
    description: "Nominal value per unit (as string to handle precision)",
    example: "100000",
  })
  @IsNumberString()
  @IsNotEmpty()
  nominalValue: string

  @ApiProperty({
    description: "Number of decimal places for nominal value",
    example: 2,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  nominalValueDecimals: number

  @ApiProperty({
    description: "Bond issuance start date",
    example: "2024-01-01T00:00:00Z",
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startingDate: Date

  @ApiProperty({
    description: "Bond maturity date",
    example: "2034-01-01T00:00:00Z",
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  maturityDate: Date

  @ApiProperty({
    description: "Configuration version number for the diamond pattern",
    example: 1,
  })
  @IsNumber()
  configVersion: number

  @ApiProperty({
    description: "EVM address of the diamond resolver contract",
    example: "0x6789012345678901234567890123456789012345",
  })
  @IsString()
  @IsNotEmpty()
  resolverAddress: string

  @ApiProperty({
    description: "Array of EVM addresses designated to receive bond proceeds",
    required: false,
    example: ["0x7890123456789012345678901234567890123456"],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  proceedRecipientAddresses?: string[]

  @ApiProperty({
    description:
      "Array of encoded data corresponding to each proceed recipient (e.g., allocation percentages, metadata)",
    required: false,
    example: ["0x0000000000000000000000000000000000000000000000000000000000000064"],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  proceedRecipientsData?: string[]
}
