// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class CancelSubscriptionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  readonly offeringId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly subscriptionId: string

  constructor(format: string, accountId: string, contractId: string, offeringId: string, subscriptionId: string) {
    super(format, accountId, contractId)
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
