// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { IsBytes32 } from "@utils/IsBytes32"

export class SetBondDocumentTransactionRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  uri: string

  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  hash: string
}
