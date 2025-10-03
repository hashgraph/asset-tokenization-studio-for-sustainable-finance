import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty, IsNumber, IsPositive } from "class-validator"

export class UpdateTreasuryBalanceCommand extends Command<void> {
  @IsNotEmpty()
  @IsHexadecimal()
  readonly fromAddress: string

  @IsNotEmpty()
  @IsHexadecimal()
  readonly toAddress: string

  @IsNumber()
  @IsPositive()
  readonly amount: number

  constructor(fromAddress: string, toAddress: string, amount: number) {
    super()
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }
}
