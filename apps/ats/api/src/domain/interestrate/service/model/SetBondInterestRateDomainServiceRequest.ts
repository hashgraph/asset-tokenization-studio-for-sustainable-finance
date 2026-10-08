// SPDX-License-Identifier: Apache-2.0
export class SetBondInterestRateDomainServiceRequest {
  readonly bondContractId: string
  readonly operator: string
  readonly maxRate: string
  readonly baseRate: string
  readonly minRate: string
  readonly startPeriod: string
  readonly startRate: string
  readonly missedPenalty: string
  readonly reportPeriod: string
  readonly rateDecimals: string

  constructor(
    bondContractId: string,
    operator: string,
    maxRate: string,
    baseRate: string,
    minRate: string,
    startPeriod: string,
    startRate: string,
    missedPenalty: string,
    reportPeriod: string,
    rateDecimals: string,
  ) {
    this.bondContractId = bondContractId
    this.operator = operator
    this.maxRate = maxRate
    this.baseRate = baseRate
    this.minRate = minRate
    this.startPeriod = startPeriod
    this.startRate = startRate
    this.missedPenalty = missedPenalty
    this.reportPeriod = reportPeriod
    this.rateDecimals = rateDecimals
  }
}
