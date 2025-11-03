// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class SetBondCapTransactionAppServiceRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  contractId: string

  @IsNumberString()
  @IsNotEmpty()
  newMaxSupply: string

  constructor(format: string, accountId: string, contractId: string, newMaxSupply: string) {
    super(format, accountId)
    this.contractId = contractId
    this.newMaxSupply = newMaxSupply
  }
}
