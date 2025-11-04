// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class SetBondCapTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNumberString()
  @IsNotEmpty()
  newMaxSupply: string

  constructor(format: string, accountId: string, contractId: string, newMaxSupply: string) {
    super(format, accountId, contractId)
    this.newMaxSupply = newMaxSupply
  }
}
