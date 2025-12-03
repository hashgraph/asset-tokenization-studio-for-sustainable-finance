// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsArray, IsNotEmpty, IsNumber } from "class-validator"

export class ExecuteOfferingBySubscriptionIdTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  readonly offeringId: number

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly subscriptionIds: number[]

  constructor(format: string, accountId: string, contractId: string, offeringId: number, subscriptionIds: number[]) {
    super(format, accountId, contractId)
    this.offeringId = offeringId
    this.subscriptionIds = subscriptionIds
  }
}
