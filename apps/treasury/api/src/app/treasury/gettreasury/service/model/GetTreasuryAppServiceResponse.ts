import { GetTreasuryPaymentTokenAppServiceResponse } from "@app/treasury/gettreasury/service/model/GetTreasuryPaymentTokenAppServiceResponse"

export class GetTreasuryAppServiceResponse {
  readonly contractId: string
  readonly bondContractId: string
  readonly paused: boolean
  readonly paymentToken?: GetTreasuryPaymentTokenAppServiceResponse
}
