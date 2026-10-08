// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsIn, ValidateNested } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { TransactionMetadata } from "@domain/model/TransactionMetadata"

export class SendSignedTransactionCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  payload: string

  @ValidateNested()
  metadata: TransactionMetadata

  @IsIn(["hedera", "ethereum"])
  format: string

  constructor(payload: string, metadata: TransactionMetadata, format: string) {
    super()
    this.payload = payload
    this.metadata = metadata
    this.format = format
  }
}
