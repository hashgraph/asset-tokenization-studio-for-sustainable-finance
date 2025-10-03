import { Event } from "@hashgraph/green-bonds-shared-core"

export class TreasuryBalanceUpdatedEvent extends Event {
  readonly contractAddress: string
  readonly bondContractAddress: string
  readonly amount: number
  readonly balance: number

  constructor(contractAddress: string, bondContractAddress: string, amount: number, balance: number) {
    super()
    this.contractAddress = contractAddress
    this.bondContractAddress = bondContractAddress
    this.amount = amount
    this.balance = balance
  }
}
