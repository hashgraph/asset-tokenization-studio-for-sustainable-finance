import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetAddedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly environmentalAsset: string

  constructor(contractId: string, transactionHash: string, operator: string, environmentalAsset: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.environmentalAsset = environmentalAsset
  }
}
