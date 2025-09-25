// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty } from "class-validator"

export class AddEventFiltersCommand extends Command<void> {
  @IsNotEmpty()
  @IsHexadecimal()
  readonly contractAddress: string

  @IsNotEmpty({ each: true })
  readonly eventSignatures: string[]

  constructor(contractAddress, eventSignatures: string[]) {
    super()
    this.contractAddress = contractAddress
    this.eventSignatures = eventSignatures
  }
}
