import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"

export interface PaymentTokenTransferRepository {
  save(paymentTokenTransfer: PaymentTokenTransfer): Promise<PaymentTokenTransfer>

  findById(id: string): Promise<PaymentTokenTransfer | null>

  findByContractId(contractId: string): Promise<PaymentTokenTransfer[]>
}
