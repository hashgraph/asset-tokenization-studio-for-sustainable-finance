// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "PaymentToken" })
export class PaymentTokenResponse {
  @ApiProperty({ description: "Hedera contract id", example: "0.0.45878" })
  contractId: string

  @ApiProperty({ description: "Payment token addition date to the treasury", example: "2025-11-18T10:26:35.769Z" })
  additionDate: Date

  @ApiProperty({ description: "Payment token removal date from the treasury", example: "2025-11-18T10:26:35.769Z" })
  removalDate: Date | null

  @ApiProperty({ description: "Error code from HTS if token dissociation has failed", example: 251 })
  dissociationError: number | null
}
