// SPDX-License-Identifier: Apache-2.0

export class CreateBondHoldDomainServiceRequest {
  bondContractId: string
  holdId: number
  holderAccountId: string
  partition: string
  amount: string
  expirationTimestamp: Date
  escrowAccountId: string
  toAccountId: string
  data: string
  operatorData: string
  operatorAccountId: string

  constructor(
    bondContractId: string,
    holdId: number,
    holderAccountId: string,
    partition: string,
    amount: string,
    expirationTimestamp: Date,
    escrowAccountId: string,
    toAccountId: string,
    data: string,
    operatorData: string,
    operatorAccountId: string,
  ) {
    this.bondContractId = bondContractId
    this.holdId = holdId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.escrowAccountId = escrowAccountId
    this.toAccountId = toAccountId
    this.data = data
    this.operatorData = operatorData
    this.operatorAccountId = operatorAccountId
  }
}
