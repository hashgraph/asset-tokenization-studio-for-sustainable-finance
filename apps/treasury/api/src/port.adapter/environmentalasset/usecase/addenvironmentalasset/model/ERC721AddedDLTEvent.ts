import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class ERC721AddedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly erc721: string

  constructor(operator: string, erc721: string) {
    super()
    this.operator = operator
    this.erc721 = erc721
  }
}
