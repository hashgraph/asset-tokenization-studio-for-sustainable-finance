import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"

export interface PaymentTokenTransferRepository {
  save(paymentTokenTransfer: PaymentTokenTransfer): Promise<PaymentTokenTransfer>

  findById(id: string): Promise<PaymentTokenTransfer | null>

  findByAccountId(accountId: string): Promise<PaymentTokenTransfer[]>
}
