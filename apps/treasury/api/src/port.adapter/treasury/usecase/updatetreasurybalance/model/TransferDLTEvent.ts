import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class TransferDLTEvent extends DLTEvent {
  readonly from: string
  readonly to: string
  readonly value: string

  constructor(from: string, to: string, value: string) {
    super()
    this.from = from
    this.to = to
    this.value = value
  }
}
