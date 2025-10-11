import { GetTreasuryPaymentTokenQueryResponse } from "@app/treasury/gettreasury/query/GetTreasuryPaymentTokenQueryResponse"

export class GetTreasuryQueryResponse {
  readonly contractId
  readonly bondContractId
  readonly paused
  readonly paymentToken: GetTreasuryPaymentTokenQueryResponse
}
