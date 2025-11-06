// SPDX-License-Identifier: Apache-2.0
export class SetBondCouponDomainServiceRequest {
  readonly contractId: string
  readonly corporateActionId: string
  readonly couponId: string
  readonly operator: string
  readonly recordDate: string
  readonly executionDate: string
  readonly rate: string

  constructor(
    contractId: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: string,
    executionDate: string,
    rate: string,
  ) {
    this.contractId = contractId
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.rate = rate
  }
}
