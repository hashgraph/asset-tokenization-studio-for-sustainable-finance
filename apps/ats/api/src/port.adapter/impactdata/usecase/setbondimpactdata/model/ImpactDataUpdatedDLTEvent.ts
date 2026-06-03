// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface ImpactDataStruct {
  readonly maxDeviationCap: string
  readonly baseLine: string
  readonly maxDeviationFloor: string
  readonly impactDataDecimals: string
  readonly adjustmentPrecision: string
}

export class ImpactDataUpdatedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly newImpactData: ImpactDataStruct

  constructor(bondContractId: string, transactionHash: string, operator: string, newImpactData: ImpactDataStruct) {
    super(bondContractId, transactionHash)
    this.operator = operator
    this.newImpactData = newImpactData
  }
}
