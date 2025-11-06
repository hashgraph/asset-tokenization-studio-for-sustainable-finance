// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class SubmitSubscriptionTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  readonly offeringDltId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly lotUnits: string

  constructor(format: string, accountId: string, contractId: string, offeringDltId: string, lotUnits: string) {
    super(format, accountId, contractId)
    this.offeringDltId = offeringDltId
    this.lotUnits = lotUnits
  }
}
