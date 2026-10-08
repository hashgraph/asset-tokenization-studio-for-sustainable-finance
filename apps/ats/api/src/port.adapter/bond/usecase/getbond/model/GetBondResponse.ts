// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"
import { GetBondQueryResponse } from "@app/bond/getbond/query/GetBondQueryResponse"

@ApiSchema({ name: "GetBond" })
export class GetBondResponse {
  @ApiProperty({ description: "Unique identifier of the bond", example: "1" })
  readonly id: string

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.6823801" })
  readonly bondContractId: string

  @ApiProperty({ description: "Treasury ID associated with the bond", example: "0.0.6823521" })
  readonly treasuryId: string

  @ApiProperty({ description: "Name of the bond", example: "Green Bond 2024" })
  readonly name: string

  @ApiProperty({ description: "Symbol of the bond", example: "B" })
  readonly symbol: string

  @ApiProperty({ description: "Number of decimals for the bond token", example: 18 })
  readonly decimals: number

  @ApiProperty({ description: "Currency of the bond", example: "USD" })
  readonly currency: string

  @ApiProperty({ description: "Nominal value of the bond", example: "1000000000000000000000" })
  readonly nominalValue: string

  @ApiProperty({ description: "Number of decimals for the nominal value", example: 18 })
  readonly nominalValueDecimals: number

  @ApiProperty({ description: "Starting date of the bond", example: "2024-01-01T00:00:00.000Z" })
  readonly startingDate: Date

  @ApiProperty({ description: "Maturity date of the bond", example: "2029-01-01T00:00:00.000Z" })
  readonly maturityDate: Date

  @ApiProperty({ description: "Maximum supply of the bond", example: "1000000000000000000000000" })
  readonly maxSupply: string

  @ApiProperty({ description: "ISIN code of the bond", example: "US1234567890" })
  readonly isin: string

  @ApiProperty({ description: "Indicates if the bond is paused", example: false })
  readonly isPaused: boolean

  static fromGetBondQueryResponse(this: void, queryResponse: GetBondQueryResponse): GetBondResponse {
    const response = new GetBondResponse()
    Object.assign(response, {
      id: queryResponse.id,
      bondContractId: queryResponse.contractId,
      treasuryId: queryResponse.treasuryId,
      name: queryResponse.name,
      symbol: queryResponse.symbol,
      decimals: queryResponse.decimals,
      currency: queryResponse.currency,
      nominalValue: queryResponse.nominalValue,
      nominalValueDecimals: queryResponse.nominalValueDecimals,
      startingDate: queryResponse.startingDate,
      maturityDate: queryResponse.maturityDate,
      maxSupply: queryResponse.maxSupply,
      isin: queryResponse.isin,
      isPaused: queryResponse.isPaused,
    })
    return response
  }
}
