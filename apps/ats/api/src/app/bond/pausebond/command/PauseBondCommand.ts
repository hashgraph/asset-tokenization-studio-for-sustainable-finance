import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class PauseBondCommand extends Command<void> {
  @IsNotEmpty()
  bondContractId: string

  constructor(bondContractId: string) {
    super()
    this.bondContractId = bondContractId
  }
}
