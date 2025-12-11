// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondProceedRecipients" })
export class BondProceedRecipientsResponse {
  @ApiProperty({ description: "Unique identifier of the proceed recipient", example: "1" })
  id: string

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.7364918" })
  bondContractId: string

  @ApiProperty({
    description: "Address of the proceed recipient",
    example: "0x5736e3e8160d54fda78a086b28241733e165749f",
  })
  proceedRecipientAddress: string

  @ApiProperty({ description: "Additional data for the recipient", example: "0x", required: false })
  data?: string

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date
}
