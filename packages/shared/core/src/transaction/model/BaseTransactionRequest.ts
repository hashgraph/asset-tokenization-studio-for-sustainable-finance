// SPDX-License-Identifier: Apache-2.0

import { IsIn, IsNotEmpty, ValidateIf } from "class-validator"

export abstract class BaseTransactionRequest {
  @IsNotEmpty()
  @IsIn(["hedera", "ethereum"])
  format: string

  @IsNotEmpty()
  @ValidateIf((object) => object?.format === "hedera")
  accountId?: string

  protected constructor(format: string, accountId: string) {
    this.format = format
    this.accountId = accountId
  }
}
