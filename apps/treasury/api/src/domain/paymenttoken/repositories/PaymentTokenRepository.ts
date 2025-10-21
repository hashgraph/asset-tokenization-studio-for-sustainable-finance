import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface PaymentTokenRepository {
  save(paymentToken: PaymentToken): Promise<PaymentToken>
  findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<PaymentToken>>
}
