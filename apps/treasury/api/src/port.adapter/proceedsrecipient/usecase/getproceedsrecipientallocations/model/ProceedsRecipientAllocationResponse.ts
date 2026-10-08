// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "ProceedsRecipientAllocation" })
export class ProceedsRecipientAllocationResponse {
  @ApiProperty({ description: "Allocation amount", example: "57986.45" })
  amount: string

  @ApiProperty({ description: "Creation date of the allocation", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
