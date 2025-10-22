// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class AddPaymentTokenTransferAppServiceRequest {
  @IsNotEmpty()
  paymentTokenContractId: string

  @IsNotEmpty()
  fromAccountId: string

  @IsNotEmpty()
  toAccountId: string

  amount?: string
}
