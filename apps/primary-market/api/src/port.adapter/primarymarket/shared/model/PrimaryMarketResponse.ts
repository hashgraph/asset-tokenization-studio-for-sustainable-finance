// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "PrimaryMarket" })
export class PrimaryMarketResponse {
  @ApiProperty({ description: "Primary market contract ID", example: "0.0.7290602" })
  contractId: string

  @ApiProperty({ description: "Whether the primary market is paused", example: false })
  isPaused: boolean

  @ApiProperty({ description: "Creation date", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
