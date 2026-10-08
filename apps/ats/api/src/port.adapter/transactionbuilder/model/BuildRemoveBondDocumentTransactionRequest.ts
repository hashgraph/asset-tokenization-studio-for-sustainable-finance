// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { IsBytes32 } from "@utils/IsBytes32"

export class BuildRemoveBondDocumentTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  name: string
}
