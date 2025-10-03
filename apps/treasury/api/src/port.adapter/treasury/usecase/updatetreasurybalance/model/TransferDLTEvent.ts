import { Event } from "@hashgraph/green-bonds-shared-core"

export class TransferDLTEvent extends Event {
  readonly from: string
  readonly to: string
  readonly value: number

  constructor(from: string, to: string, value: number) {
    super()
    this.from = from
    this.to = to
    this.value = value
  }
}
