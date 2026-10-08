// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondHolders" })
export class BondHoldersResponse {
  @ApiProperty({ description: "Unique identifier of the bond holder record", example: "1" })
  id: string

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.5421763" })
  bondContractId: string

  @ApiProperty({ description: "Account ID of the bond holder", example: "0.0.5421763" })
  holderAccountId: string

  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000001",
  })
  partition: string

  @ApiProperty({ description: "Available balance of the holder", example: "1000000000000000000000" })
  availableBalance: string

  @ApiProperty({ description: "Locked balance of the holder", example: "500000000000000000000" })
  lockedBalance: string
}
