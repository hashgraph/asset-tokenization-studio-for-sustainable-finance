// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsEnum } from "class-validator"

export class UpdateClearingBalanceCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  amount: string

  @IsEnum(["CLEARING_LOCK", "CLEARING_UNLOCK", "CLEARING_EXECUTE"])
  @IsNotEmpty()
  operation: "CLEARING_LOCK" | "CLEARING_UNLOCK" | "CLEARING_EXECUTE"

  constructor(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    amount: string,
    operation: "CLEARING_LOCK" | "CLEARING_UNLOCK" | "CLEARING_EXECUTE",
  ) {
    super()
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.amount = amount
    this.operation = operation
  }
}
