import { GetTreasuryPaymentTokenResponse } from "@port/treasury/usecase/gettreasury/model/GetTreasuryPaymentTokenResponse"
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "TreasuryDetails" })
export class GetTreasuryResponse {
  @ApiProperty({ description: "Hedera Contract Id", example: "0.0.2378" })
  readonly contractId: string

  @ApiProperty({ description: "Bond Hedera Contract Id", example: "0.0.9865" })
  readonly bondContractId: string

  @ApiProperty({ description: "If treasury is paused", example: true })
  readonly paused: boolean

  @ApiProperty({ description: "If treasury is paused" })
  readonly paymentToken?: GetTreasuryPaymentTokenResponse
}
