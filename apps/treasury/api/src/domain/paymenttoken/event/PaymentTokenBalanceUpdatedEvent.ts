import { Event } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenBalanceUpdatedEvent extends Event {
  readonly treasuryId: string
  readonly amount: string
  readonly balance: string

  constructor(treasuryId: string, amount: string, balance: string) {
    super()
    this.treasuryId = treasuryId
    this.amount = amount
    this.balance = balance
  }
}
