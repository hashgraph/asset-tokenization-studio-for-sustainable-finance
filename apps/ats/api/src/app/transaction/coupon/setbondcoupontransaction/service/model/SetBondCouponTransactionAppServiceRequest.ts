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
  startDate: string

  @IsNumberString()
  @IsNotEmpty()
  endDate: string

  @IsNumberString()
  @IsNotEmpty()
  fixingDate: string

  @IsNumberString()
  @IsNotEmpty()
  rate: string

  @IsNumberString()
  @IsNotEmpty()
  rateDecimals: string

  @IsNumberString()
  @IsNotEmpty()
  rateStatus: string

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    recordDate: string,
    executionDate: string,
    startDate: string,
    endDate: string,
    fixingDate: string,
    rate: string,
    rateDecimals: string,
    rateStatus: string,
  ) {
    super(format, accountId, bondContractId)
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.startDate = startDate
    this.endDate = endDate
    this.fixingDate = fixingDate
    this.rate = rate
    this.rateDecimals = rateDecimals
    this.rateStatus = rateStatus
  }
}
