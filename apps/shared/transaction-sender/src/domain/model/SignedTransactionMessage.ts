// SPDX-License-Identifier: Apache-2.0

import { IsString, IsNotEmpty, IsHexadecimal, ValidateNested, IsOptional, IsIn } from "class-validator"
import { TransactionMetadata } from "./TransactionMetadata"

export class SignedTransactionMessage {
  @IsString()
  @IsNotEmpty()
  @IsHexadecimal()
  payload: string

  @ValidateNested()
  @IsOptional()
  metadata?: TransactionMetadata

  @IsIn(["hedera", "ethereum"])
  format: string
}
