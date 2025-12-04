// SPDX-License-Identifier: Apache-2.0
export class SetBondCapDomainServiceRequest {
  contractId: string
  newMaxSupply: string

  constructor(contractId: string, newMaxSupply: string) {
    this.contractId = contractId
    this.newMaxSupply = newMaxSupply
  }
}
