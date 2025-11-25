// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"

export class DeployPrimaryMarketDomainServiceRequest {
  @IsString()
  @IsNotEmpty()
  contractId: string

  constructor(contractId: string) {
    this.contractId = contractId
  }
}
