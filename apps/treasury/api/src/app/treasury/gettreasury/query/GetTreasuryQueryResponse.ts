import { GetTreasuryPaymentTokenQueryResponse } from "@app/treasury/gettreasury/query/GetTreasuryPaymentTokenQueryResponse"

export class GetTreasuryQueryResponse {
  readonly contractId: string
  readonly bondContractId: string
  readonly paused: boolean
  readonly paymentToken?: GetTreasuryPaymentTokenQueryResponse
}
