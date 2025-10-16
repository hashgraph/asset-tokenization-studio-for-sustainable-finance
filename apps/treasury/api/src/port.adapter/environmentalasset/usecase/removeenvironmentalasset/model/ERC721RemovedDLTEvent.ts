import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetRemovedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly environmentalAsset: string
  readonly dissociationError?: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    environmentalAsset: string,
    dissociationError?: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.environmentalAsset = environmentalAsset
    this.dissociationError = dissociationError
  }
}
