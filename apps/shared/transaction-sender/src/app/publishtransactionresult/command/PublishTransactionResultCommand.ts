// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsIn, ValidateNested } from "class-validator"
import { TransactionMetadata } from "@domain/model/TransactionMetadata"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class PublishTransactionResultCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  payload: string

  @ValidateNested()
  metadata: TransactionMetadata

  @IsIn(["hedera", "ethereum"])
  format: string

  @IsNotEmpty()
  @IsString()
  transactionHash: string

  @IsIn(["success", "failed"])
  status: "success" | "failed"

  errorCode?: string

  constructor(
    payload: string,
    metadata: TransactionMetadata,
    format: string,
    transactionHash: string,
    status: "success" | "failed",
    errorCode?: string,
  ) {
    super()
    this.payload = payload
    this.metadata = metadata
    this.format = format
    this.transactionHash = transactionHash
    this.status = status
    this.errorCode = errorCode
  }
}
