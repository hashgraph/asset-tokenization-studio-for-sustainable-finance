import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetRemovedEvent extends Event {
  readonly contractAddress: string
  readonly bondContractAddress: string
  readonly erc721Address: string
  readonly deletedAt: Date

  constructor(contractAddress: string, bondContractAddress: string, erc721Address: string, deletedAt: Date) {
    super()
    this.contractAddress = contractAddress
    this.bondContractAddress = bondContractAddress
    this.erc721Address = erc721Address
    this.deletedAt = deletedAt
  }
}
