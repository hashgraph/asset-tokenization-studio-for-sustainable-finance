// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "Bond" })
export class BondResponse {
  @ApiProperty({ description: "Unique identifier of the bond", example: "1" })
  id: string

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.7364918" })
  contractId: string

  @ApiProperty({ description: "Treasury ID associated with the bond", example: "0.0.7364918" })
  treasuryId: string

  @ApiProperty({ description: "Name of the bond", example: "Green Bond 2024" })
  name: string

  @ApiProperty({ description: "Symbol of the bond", example: "GB24" })
  symbol: string

  @ApiProperty({ description: "ISIN code of the bond", example: "US1234567890" })
  isin: string

  @ApiProperty({ description: "Number of decimals for the bond token", example: 18 })
  decimals: number

  @ApiProperty({ description: "Currency of the bond", example: "USD" })
  currency: string

  @ApiProperty({ description: "Nominal value of the bond", example: "1000000000000000000000" })
  nominalValue: string

  @ApiProperty({ description: "Number of decimals for the nominal value", example: 18 })
  nominalValueDecimals: number

  @ApiProperty({ description: "Starting date of the bond", example: "2024-01-01T00:00:00.000Z" })
  startingDate: Date

  @ApiProperty({ description: "Maturity date of the bond", example: "2029-01-01T00:00:00.000Z" })
  maturityDate: Date

  @ApiProperty({ description: "Maximum supply of the bond", example: "1000000000000000000000000" })
  maxSupply: string

  @ApiProperty({ description: "Indicates if the bond is paused", example: false })
  isPaused: boolean
}
