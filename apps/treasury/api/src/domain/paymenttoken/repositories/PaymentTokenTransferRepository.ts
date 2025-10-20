import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"

export interface PaymentTokenTransferRepository {
  save(paymentTokenTransfer: PaymentTokenTransfer): Promise<PaymentTokenTransfer>

  findByPaymentTokenId(
    paymentTokenId: string,
    options: PageOptions,
    type?: string,
  ): Promise<Page<PaymentTokenTransfer>>

}
