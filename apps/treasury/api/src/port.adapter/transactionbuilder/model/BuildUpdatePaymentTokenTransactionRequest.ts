// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class BuildUpdatePaymentTokenTransactionRequest extends BaseBuildTransactionRequest {
  @IsNotEmpty()
  paymentTokenContractId: string
}
