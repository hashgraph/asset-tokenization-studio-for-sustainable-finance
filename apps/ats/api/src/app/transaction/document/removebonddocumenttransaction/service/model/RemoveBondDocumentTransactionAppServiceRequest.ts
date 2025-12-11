// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { IsBytes32 } from "@utils/IsBytes32"

export class RemoveBondDocumentTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  name: string

  constructor(format: string, accountId: string, bondContractId: string, name: string) {
    super(format, accountId, bondContractId)
    this.name = name
  }
}
