import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "TreasuryPaymentToken" })
export class GetTreasuryPaymentTokenResponse {
  @ApiProperty({ description: "Hedera Contract Id", example: "0.0.2378" })
  readonly contractId: string

  @ApiProperty({ description: "Treasury payment token balance", example: "6.05" })
  readonly balance: string

  @ApiProperty({ description: "Addition date to the treasury", example: "2025-11-18T10:26:35.769Z" })
  readonly additionDate: Date

  @ApiProperty({ description: "Removal date from the treasury", example: "2025-11-18T10:26:35.769Z" })
  readonly removalDate?: Date
}
