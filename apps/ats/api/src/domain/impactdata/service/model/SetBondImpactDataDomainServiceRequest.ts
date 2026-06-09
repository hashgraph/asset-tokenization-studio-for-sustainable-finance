// SPDX-License-Identifier: Apache-2.0
export class SetBondImpactDataDomainServiceRequest {
  readonly bondContractId: string
  readonly operator: string
  readonly maxDeviationCap: string
  readonly baseLine: string
  readonly maxDeviationFloor: string
  readonly impactDataDecimals: string
  readonly adjustmentPrecision: string

  constructor(
    bondContractId: string,
    operator: string,
    maxDeviationCap: string,
    baseLine: string,
    maxDeviationFloor: string,
    impactDataDecimals: string,
    adjustmentPrecision: string,
  ) {
    this.bondContractId = bondContractId
    this.operator = operator
    this.maxDeviationCap = maxDeviationCap
    this.baseLine = baseLine
    this.maxDeviationFloor = maxDeviationFloor
    this.impactDataDecimals = impactDataDecimals
    this.adjustmentPrecision = adjustmentPrecision
  }
}
