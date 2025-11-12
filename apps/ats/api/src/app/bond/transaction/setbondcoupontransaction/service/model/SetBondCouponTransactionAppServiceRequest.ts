// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class SetBondCouponTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNumberString()
  @IsNotEmpty()
  recordDate: string

  @IsNumberString()
  @IsNotEmpty()
  executionDate: string

  @IsNumberString()
  @IsNotEmpty()
  rate: string

  @IsNumberString()
  @IsNotEmpty()
  rateDecimals: string

  @IsNumberString()
  @IsNotEmpty()
  period: string

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    recordDate: string,
    executionDate: string,
    rate: string,
    rateDecimals: string,
    period: string,
  ) {
    super(format, accountId, contractId)
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.rate = rate
    this.rateDecimals = rateDecimals
    this.period = period
  }
}
