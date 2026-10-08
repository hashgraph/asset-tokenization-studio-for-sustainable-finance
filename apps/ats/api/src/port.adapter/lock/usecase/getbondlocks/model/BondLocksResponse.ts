// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondLocks" })
export class BondLocksResponse {
  @ApiProperty({ description: "Unique identifier of the bond lock", example: 1 })
  id: number

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.7364918" })
  bondContractId: string

  @ApiProperty({ description: "Account ID of the bond holder", example: "0.0.5421767" })
  holderAccountId: string

  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000001",
  })
  partition: string

  @ApiProperty({ description: "Amount of tokens locked", example: "1000000000000000000000" })
  amount: string

  @ApiProperty({ description: "Expiration timestamp of the lock", example: "2024-12-31T23:59:59.000Z" })
  expirationTimestamp: Date

  @ApiProperty({ description: "Operator account ID", example: "0xoperator123456" })
  operatorAccountId: string

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date
}
