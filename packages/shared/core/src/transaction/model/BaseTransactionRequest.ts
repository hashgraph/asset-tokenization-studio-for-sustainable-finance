// SPDX-License-Identifier: Apache-2.0

import { IsIn, IsNotEmpty, ValidateIf } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export abstract class BaseTransactionRequest {
  @ApiProperty({ description: "Transaction format", example: "hedera", required: true, enum: ["hedera", "ethereum"] })
  @IsNotEmpty()
  @IsIn(["hedera", "ethereum"])
  format: string

  @IsNotEmpty()
  @ValidateIf((object) => object?.format === "hedera")
  @ApiProperty({ description: "Hedera Account Id. Only mandatory if format is hedera", example: "hedera" })
  accountId?: string

  protected constructor(format: string, accountId: string) {
    this.format = format
    this.accountId = accountId
  }
}
