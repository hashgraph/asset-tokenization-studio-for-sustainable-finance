// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class CancelOfferingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  readonly offeringId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly start: string

  @IsNotEmpty()
  @IsNumberString()
  readonly end: string

  constructor(format: string, accountId: string, contractId: string, offeringId: string, start: string, end: string) {
    super(format, accountId, contractId)
    this.offeringId = offeringId
    this.start = start
    this.end = end
  }
}
