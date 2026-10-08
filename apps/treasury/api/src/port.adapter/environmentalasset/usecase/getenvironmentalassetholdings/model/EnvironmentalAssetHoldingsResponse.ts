// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "EnvironmentalAssetHoldings" })
export class EnvironmentalAssetHoldingsResponse {
  @ApiProperty({ description: "Environmental asset token id", example: 1 })
  readonly tokenId: number

  @ApiProperty({
    description: "Date in which the token id of the environmental asset has been added to the treasury",
    example: "2025-11-18T10:26:35.769Z",
  })
  readonly additionDate: Date
}
