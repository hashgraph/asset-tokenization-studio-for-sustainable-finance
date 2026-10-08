// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class DeployPrimaryMarketTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  readonly resolverContractId: string

  @IsNumber()
  readonly configVersion: number

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    resolverContractId: string,
    configVersion: number,
  ) {
    super(format, accountId, contractId)
    this.resolverContractId = resolverContractId
    this.configVersion = configVersion
  }
}
