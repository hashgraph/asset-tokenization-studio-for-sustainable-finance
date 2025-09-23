// SPDX-License-Identifier: Apache-2.0

import { IsString, IsNotEmpty, IsHexadecimal, ValidateNested, IsIn } from "class-validator"
import { TransactionMetadata } from "./TransactionMetadata"

export class SignedTransactionMessage {
  @IsString()
  @IsNotEmpty()
  @IsHexadecimal()
  payload: string

  @ValidateNested()
  metadata: TransactionMetadata

  @IsIn(["hedera", "ethereum"])
  format: string
}
