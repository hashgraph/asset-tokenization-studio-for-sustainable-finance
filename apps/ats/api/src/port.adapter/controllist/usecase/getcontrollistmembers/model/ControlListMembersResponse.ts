// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "ControlListMembers" })
export class ControlListMembersResponse {
  @ApiProperty({ description: "Unique identifier of the control list member", example: "1" })
  id: string

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.5421744" })
  bondContractId: string

  @ApiProperty({ description: "Account ID of the holder in the control list", example: "0.0.5421745" })
  holderAccountId: string

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date
}
