import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class LockedByPartitionDLTEvent extends DLTEvent {
  readonly operator: string
  readonly tokenHolder: string
  readonly partition: string
  readonly lockId: number
  readonly amount: string
  readonly expirationTimestamp: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    tokenHolder: string,
    partition: string,
    lockId: number,
    amount: string,
    expirationTimestamp: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.tokenHolder = tokenHolder
    this.partition = partition
    this.lockId = lockId
    this.amount = amount
    this.expirationTimestamp = expirationTimestamp
  }
}
