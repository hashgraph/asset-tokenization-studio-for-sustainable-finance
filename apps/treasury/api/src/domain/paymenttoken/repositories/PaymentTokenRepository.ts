import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"

export interface PaymentTokenRepository {
  save(paymentToken: PaymentToken): Promise<PaymentToken>
}
