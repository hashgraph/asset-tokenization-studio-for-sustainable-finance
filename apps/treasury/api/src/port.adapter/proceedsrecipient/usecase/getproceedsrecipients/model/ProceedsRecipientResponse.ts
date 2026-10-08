// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "ProceedsRecipient" })
export class ProceedsRecipientResponse {
  @ApiProperty({ description: "Hedera contract id", example: "0.0.45878" })
  contractId: string

  @ApiProperty({ description: "Creation date of the proceeds recipient", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
