// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "PaymentTokenTransfer" })
export class PaymentTokenTransferResponse {
  @ApiProperty({
    description: "Hedera account id that is the sender or the receiver of the transfer",
    example: "0.0.45878",
  })
  accountId: string

  @ApiProperty({ description: "Amount of tokens that has been transferred", example: "57986.45" })
  amount: string

  @ApiProperty({ description: "Type of the transfer", example: "INFLOW", enum: ["INFLOW", "OUTFLOW"] })
  type: string

  @ApiProperty({ description: "Date of the transfer", example: "2025-11-18T10:26:35.769Z" })
  transferDate: Date
}
