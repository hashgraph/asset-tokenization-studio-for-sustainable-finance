// SPDX-License-Identifier: Apache-2.0
export class SetBondCapDomainServiceRequest {
  bondContractId: string
  newMaxSupply: string

  constructor(contractId: string, newMaxSupply: string) {
    this.bondContractId = contractId
    this.newMaxSupply = newMaxSupply
  }
}
