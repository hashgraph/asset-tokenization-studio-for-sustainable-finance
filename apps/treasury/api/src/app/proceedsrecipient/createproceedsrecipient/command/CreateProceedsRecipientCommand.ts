// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"
import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"

export class CreateProceedsRecipientCommand extends Command<ProceedsRecipient> {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryContractId: string

  constructor(contractId: string, treasuryContractId: string) {
    super()
    this.contractId = contractId
    this.treasuryContractId = treasuryContractId
  }
}
