// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber } from "class-validator"

export class CancelSubscriptionTransactionRequest extends BaseTransactionRequest {
  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number
}
