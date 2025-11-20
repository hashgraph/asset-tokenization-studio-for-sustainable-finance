// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "Treasury" })
export class TreasuryResponse {
  @ApiProperty({ description: "Hedera Contract Id", example: "0.0.2378" })
  contractId: string

  @ApiProperty({ description: "Bond Hedera Contract Id", example: "0.0.9865" })
  bondContractId: string

  @ApiProperty({ description: "If treasury is paused", example: true })
  paused: boolean

  @ApiProperty({ description: "Creation date", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
