// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator"

export class CancelOfferingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  readonly offeringId: number

  @IsNotEmpty()
  @IsNumberString()
  readonly start: string

  @IsNotEmpty()
  @IsNumberString()
  readonly end: string

  constructor(format: string, accountId: string, contractId: string, offeringId: number, start: string, end: string) {
    super(format, accountId, contractId)
    this.offeringId = offeringId
    this.start = start
    this.end = end
  }
}
