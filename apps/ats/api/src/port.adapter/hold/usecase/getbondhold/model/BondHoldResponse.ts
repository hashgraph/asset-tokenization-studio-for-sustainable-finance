// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondHold" })
export class BondHoldResponse {
  @ApiProperty({ description: "Unique identifier of the bond hold", example: 1 })
  id: number

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.6823801" })
  bondContractId: string

  @ApiProperty({ description: "Account ID of the bond holder", example: "0.0.5421763" })
  holderAccountId: string

  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000001",
  })
  partition: string

  @ApiProperty({ description: "Amount of tokens held", example: "100000000000" })
  amount: string

  @ApiProperty({ description: "Expiration timestamp of the hold", example: "2024-12-31T23:59:59.000Z" })
  expirationTimestamp: Date

  @ApiProperty({ description: "Escrow account ID", example: "0.0.5421763" })
  escrowAccountId: string

  @ApiProperty({ description: "Destination account ID", example: "0.0.5421763" })
  toAccountId: string

  @ApiProperty({ description: "Additional data for the hold", example: "0x" })
  data: string

  @ApiProperty({ description: "Operator data for the hold", example: "0x" })
  operatorData: string

  @ApiProperty({ description: "Operator account ID", example: "0.0.5421763" })
  operatorAccountId: string

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date
}
