// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class DeleteControlListMemberCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  contractId: string

  @IsString()
  @IsNotEmpty()
  holderId: string

  constructor(contractId: string, holderId: string) {
    super()
    this.contractId = contractId
    this.holderId = holderId
  }
}
