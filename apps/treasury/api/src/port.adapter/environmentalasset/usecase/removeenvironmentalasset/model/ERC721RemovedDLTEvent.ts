import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ERC721RemovedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly erc721: string

  constructor(contractId: string, transactionHash: string, operator: string, erc721: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.erc721 = erc721
  }
}
