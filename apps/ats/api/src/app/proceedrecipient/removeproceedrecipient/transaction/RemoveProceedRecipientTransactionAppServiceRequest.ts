// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class RemoveProceedRecipientTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string

  constructor(format: string, accountId: string, contractId: string, proceedRecipientAddress: string) {
    super(format, accountId, contractId)
    this.proceedRecipientAddress = proceedRecipientAddress
  }
}
