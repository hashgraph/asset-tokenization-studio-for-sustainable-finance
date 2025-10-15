import { GetTreasuryPaymentTokenResponse } from "@port/treasury/usecase/gettreasury/model/GetTreasuryPaymentTokenResponse"

export class GetTreasuryResponse {
  readonly contractId: string
  readonly bondContractId: string
  readonly paused: boolean
  readonly paymentToken?: GetTreasuryPaymentTokenResponse
}
