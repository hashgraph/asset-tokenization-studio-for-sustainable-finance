// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class CancelOfferingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  readonly offeringDltId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly start: string

  @IsNotEmpty()
  @IsNumberString()
  readonly end: string

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    offeringDltId: string,
    start: string,
    end: string,
  ) {
    super(format, accountId, contractId)
    this.offeringDltId = offeringDltId
    this.start = start
    this.end = end
  }
}
