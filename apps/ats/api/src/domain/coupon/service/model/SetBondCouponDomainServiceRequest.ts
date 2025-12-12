// SPDX-License-Identifier: Apache-2.0
export class SetBondCouponDomainServiceRequest {
  readonly bondContractId: string
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly recordDate: Date
  readonly executionDate: Date
  readonly rate: string
  readonly rateDecimals: string
  readonly period: string

  constructor(
    bondContractId: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: Date,
    executionDate: Date,
    rate: string,
    rateDecimals: string,
    period: string,
  ) {
    this.bondContractId = bondContractId
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.rate = rate
    this.rateDecimals = rateDecimals
    this.period = period
  }
}
