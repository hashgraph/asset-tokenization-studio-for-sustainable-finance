import { Event } from "@hashgraph/green-bonds-shared-core"

export class TreasuryBalanceUpdatedEvent extends Event {
  readonly contractAddress: string
  readonly bondContractAddress: string
  readonly balance: number

  constructor(contractAddress: string, bondContractAddress: string, balance: number) {
    super()
    this.contractAddress = contractAddress
    this.bondContractAddress = bondContractAddress
    this.balance = balance
  }
}
