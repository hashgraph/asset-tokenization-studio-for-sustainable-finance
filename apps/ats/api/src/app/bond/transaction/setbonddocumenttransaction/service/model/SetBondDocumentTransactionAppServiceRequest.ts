// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { IsBytes32 } from "@utils/IsBytes32"

export class SetBondDocumentTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  name: string

  @IsString()
  @IsNotEmpty()
  uri: string

  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  hash: string

  constructor(format: string, accountId: string, contractId: string, name: string, uri: string, hash: string) {
    super(format, accountId, contractId)
    this.name = name
    this.uri = uri
    this.hash = hash
  }
}
