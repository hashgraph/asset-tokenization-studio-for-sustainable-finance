// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "RedemptionHolder" })
export class RedemptionHolderResponse {
  @ApiProperty({ description: "Hedera account Id", example: "0.0.2378" })
  accountId: string

  @ApiProperty({ description: "Status", example: "0.0.2378", enum: ["SUCCESS", "FAILED"] })
  status: string

  @ApiProperty({ description: "Amount that has been paid to the holder", example: "5678.99" })
  amount: string | null
}
