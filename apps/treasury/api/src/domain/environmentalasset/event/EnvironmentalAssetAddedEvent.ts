import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetAddedEvent extends Event {
  readonly treasuryContractId: string
  readonly bondContractId: string
  readonly assetContractId: string

  constructor(treasuryContractId: string, bondContractId: string, assetContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.bondContractId = bondContractId
    this.assetContractId = assetContractId
  }
}
