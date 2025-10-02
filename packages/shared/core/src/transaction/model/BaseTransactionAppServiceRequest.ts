// SPDX-License-Identifier: Apache-2.0

import { IsIn, IsNotEmpty, ValidateIf } from "class-validator"

export abstract class BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsIn(["hedera", "ethereum"])
  format: string

  @IsNotEmpty()
  @ValidateIf((object) => object?.format === "hedera")
  accountId?: string

  @IsNotEmpty()
  @ValidateIf((object) => object?.format === "hedera")
  contractId?: string

  @IsNotEmpty()
  @ValidateIf((object) => object?.format === "ethereum")
  contractAddress?: string

  constructor(format: string, accountId: string, contractId: string, contractAddress: string) {
    this.format = format
    this.accountId = accountId
    this.contractId = contractId
    this.contractAddress = contractAddress
  }
}
