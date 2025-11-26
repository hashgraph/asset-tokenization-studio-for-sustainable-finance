// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"
import { IsString, IsNotEmpty } from "class-validator"

export class PrimaryMarketDeployedEvent extends Event {
  @IsString()
  @IsNotEmpty()
  contractId: string

  constructor(contractId: string) {
    super()
    this.contractId = contractId
  }
}
