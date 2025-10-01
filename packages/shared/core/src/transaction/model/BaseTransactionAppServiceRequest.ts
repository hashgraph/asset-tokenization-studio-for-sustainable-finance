// SPDX-License-Identifier: Apache-2.0

import { IsIn } from "class-validator"

export abstract class BaseTransactionAppServiceRequest {
  @IsIn(["hedera", "ethereum"])
  format: string

  protected constructor(format: string) {
    this.format = format
  }
}
