// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class BuildSetBondCapTransactionRequest extends BaseBuildTransactionRequest {
  @IsNumberString()
  @IsNotEmpty()
  newMaxSupply: string
}
