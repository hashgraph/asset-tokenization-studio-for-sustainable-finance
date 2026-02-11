// SPDX-License-Identifier: Apache-2.0
export class SetBondCouponDomainServiceRequest {
  readonly bondContractId: string
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly recordDate: Date
  readonly executionDate: Date
  readonly startDate: Date
  readonly endDate: Date
  readonly fixingDate: Date
  readonly rate: string
  readonly rateDecimals: string
  readonly rateStatus: string

  constructor(
    bondContractId: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: Date,
    executionDate: Date,
    startDate: Date,
    endDate: Date,
    fixingDate: Date,
    rate: string,
    rateDecimals: string,
    rateStatus: string,
  ) {
    this.bondContractId = bondContractId
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
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
