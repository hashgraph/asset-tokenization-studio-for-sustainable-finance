// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class AddProceedRecipientTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string

  @IsString()
  @IsOptional()
  data?: string

  constructor(format: string, accountId: string, contractId: string, proceedRecipientAddress: string, data?: string) {
    super(format, accountId, contractId)
    this.proceedRecipientAddress = proceedRecipientAddress
    this.data = data
  }
}
