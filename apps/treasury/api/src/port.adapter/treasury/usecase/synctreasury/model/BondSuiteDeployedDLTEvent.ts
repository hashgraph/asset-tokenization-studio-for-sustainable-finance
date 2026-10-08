// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { TreasuryDataEventModel } from "./TreasuryDataEventModel"

export class BondSuiteDeployedDLTEvent extends DLTEvent {
  readonly bondAddress: string
  readonly treasuryAddress: string
  readonly treasuryData: TreasuryDataEventModel

  constructor(
    contractId: string,
    transactionHash: string,
    bondAddress: string,
    treasuryAddress: string,
    treasuryData: TreasuryDataEventModel,
  ) {
    super(contractId, transactionHash)
    this.bondAddress = bondAddress
    this.treasuryAddress = treasuryAddress
    this.treasuryData = treasuryData
  }
}
