// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class CancelSubscriptionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  readonly offeringDltId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly subscriptionDltId: string

  constructor(format: string, accountId: string, contractId: string, offeringDltId: string, subscriptionDltId: string) {
    super(format, accountId, contractId)
    this.offeringDltId = offeringDltId
    this.subscriptionDltId = subscriptionDltId
  }
}
