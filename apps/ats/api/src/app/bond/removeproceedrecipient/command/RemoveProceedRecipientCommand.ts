// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class RemoveProceedRecipientCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  proceedRecipientAddress: string

  constructor(contractId: string, proceedRecipientAddress: string) {
    super()
    this.contractId = contractId
    this.proceedRecipientAddress = proceedRecipientAddress
  }
}
