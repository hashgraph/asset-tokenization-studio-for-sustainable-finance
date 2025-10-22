// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { IsBytes32 } from "@utils/IsBytes32"

export class BuildSetBondDocumentTransactionRequest extends BaseBuildTransactionRequest {
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
}
