import { DLTEvent } from "@hashgraph/green-bonds-shared-core/dist/event/DLTEvent"

export class TokenDissociatedDLTEvent extends DLTEvent {
  readonly token: string

  constructor(contractId: string, transactionHash: string, token: string) {
    super(contractId, transactionHash)
    this.token = token
  }
}
