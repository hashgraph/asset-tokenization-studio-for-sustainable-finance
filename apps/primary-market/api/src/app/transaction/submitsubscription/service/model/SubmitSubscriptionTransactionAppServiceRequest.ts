// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator"

export class SubmitSubscriptionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  readonly offeringId: number

  @IsNotEmpty()
  @IsNumberString()
  readonly lotUnits: string

  constructor(format: string, accountId: string, contractId: string, offeringId: number, lotUnits: string) {
    super(format, accountId, contractId)
    this.offeringId = offeringId
    this.lotUnits = lotUnits
  }
}
