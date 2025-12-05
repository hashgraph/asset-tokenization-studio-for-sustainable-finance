export class CreateBondLockDomainServiceRequest {
  lockId: number
  bondContractId: string
  holderAccountId: string
  partition: string
  amount: string
  expirationTimestamp: Date
  operatorAccountId: string

  constructor(
    lockId: number,
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    expirationTimestamp: Date,
    operatorAccountId: string,
  ) {
    this.lockId = lockId
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
    this.operatorAccountId = operatorAccountId
  }
}
