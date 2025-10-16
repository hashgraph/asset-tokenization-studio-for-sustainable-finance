// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsDefined, IsIn, IsNotEmpty, IsNumber } from "class-validator"

export class AddEnvironmentalAssetTransferCommand extends Command<void> {
  @IsNotEmpty()
  accountId: string

  @IsNotEmpty()
  environmentalAssetContractId: string

  @IsDefined()
  @IsNumber()
  tokenId: number

  @IsIn(["INFLOW", "OUTFLOW"])
  type: string

  constructor(accountId: string, environmentalAssetContractId: string, tokenId: number, type: string) {
    super()
    this.accountId = accountId
    this.environmentalAssetContractId = environmentalAssetContractId
    this.tokenId = tokenId
    this.type = type
  }
}
