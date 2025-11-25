// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber } from "class-validator"

export class DeployPrimaryMarketTransactionRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  resolverContractId: string

  @IsNumber()
  configVersion: number
}
