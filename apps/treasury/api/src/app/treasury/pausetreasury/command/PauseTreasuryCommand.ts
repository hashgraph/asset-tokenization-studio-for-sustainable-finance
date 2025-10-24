import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class PauseTreasuryCommand extends Command<void> {
  @IsNotEmpty()
  treasuryContractId: string

  constructor(treasuryContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
  }
}
