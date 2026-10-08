// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber } from "class-validator"

export class CancelSubscriptionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  readonly offeringId: number

  @IsNumber()
  @IsNotEmpty()
  readonly subscriptionId: number

  constructor(format: string, accountId: string, contractId: string, offeringId: number, subscriptionId: number) {
    super(format, accountId, contractId)
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
