// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class AddControlListMemberCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  holderId: string

  constructor(contractId: string, holderId: string) {
    super()
    this.contractId = contractId
    this.holderId = holderId
  }
}
