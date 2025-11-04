// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class AddControlListMemberTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  holderId: string

  constructor(format: string, accountId: string, contractId: string, holderId: string) {
    super(format, accountId, contractId)
    this.holderId = holderId
  }
}
