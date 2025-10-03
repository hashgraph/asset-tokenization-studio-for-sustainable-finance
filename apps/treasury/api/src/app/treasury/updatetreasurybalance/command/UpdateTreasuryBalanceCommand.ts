import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty } from "class-validator"

export class UpdateTreasuryBalanceCommand extends Command<void> {
  @IsNotEmpty()
  @IsHexadecimal()
  readonly fromAddress: string

  @IsNotEmpty()
  @IsHexadecimal()
  readonly toAddress: string

  @IsNotEmpty()
  readonly amount: string

  constructor(fromAddress: string, toAddress: string, amount: string) {
    super()
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }
}
