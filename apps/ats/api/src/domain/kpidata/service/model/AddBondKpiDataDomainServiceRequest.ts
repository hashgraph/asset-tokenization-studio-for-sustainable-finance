// SPDX-License-Identifier: Apache-2.0
export class AddBondKpiDataDomainServiceRequest {
  readonly bondContractId: string
  readonly project: string
  readonly date: string
  readonly value: string

  constructor(bondContractId: string, project: string, date: string, value: string) {
    this.bondContractId = bondContractId
    this.project = project
    this.date = date
    this.value = value
  }
}
