// SPDX-License-Identifier: Apache-2.0

export class AddPaymentTokenTransferAppServiceRequest {
  paymentTokenContractId: string
  fromAccountId: string
  toAccountId: string
  amount?: string
}
