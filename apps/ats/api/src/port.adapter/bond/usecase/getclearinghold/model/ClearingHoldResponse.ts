// SPDX-License-Identifier: Apache-2.0

import { ApiProperty } from "@nestjs/swagger"

export class ClearingHoldResponse {
  @ApiProperty({ description: "Unique identifier of the clearing hold", example: 1 })
  id: number

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.7364918" })
  bondContractId: string

  @ApiProperty({ description: "Account ID of the bond holder", example: "0.0.7364931" })
  holderAccountId: string

  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000001",
  })
  partition: string

  @ApiProperty({ description: "Amount of tokens in clearing hold", example: "1000000000000000000000" })
  amount: string

  @ApiProperty({ description: "Expiration date of the clearing hold", example: "2024-12-31T23:59:59.000Z" })
  expirationDate: Date

  @ApiProperty({ description: "Status of the clearing hold", example: "PENDING" })
  status: string

  @ApiProperty({ description: "Destination address for the hold", example: "0xto123456", required: false })
  toAddress?: string

  @ApiProperty({ description: "Escrow address for the hold", example: "0xescrow123456", required: false })
  escrowAddress?: string

  @ApiProperty({ description: "Additional data for the hold", example: "0x", required: false })
  data?: string

  @ApiProperty({ description: "Operator data for the hold", example: "0x", required: false })
  operatorData?: string

  @ApiProperty({ description: "Operator account ID", example: "0xoperator123456" })
  operator: string

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date
}
