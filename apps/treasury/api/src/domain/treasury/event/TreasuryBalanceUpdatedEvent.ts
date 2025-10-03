import { Event } from "@hashgraph/green-bonds-shared-core"

export class TreasuryBalanceUpdatedEvent extends Event {
  readonly contractAddress: string
  readonly bondContractAddress: string
  readonly amount: string
  readonly balance: string

  constructor(contractAddress: string, bondContractAddress: string, amount: string, balance: string) {
    super()
    this.contractAddress = contractAddress
    this.bondContractAddress = bondContractAddress
    this.amount = amount
    this.balance = balance
  }
}
