// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class SyncTokenDissociationErrorAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNotEmpty()
  readonly tokenContractId: string

  constructor(treasuryContractId: string, tokenContractId: string) {
    this.treasuryContractId = treasuryContractId
    this.tokenContractId = tokenContractId
  }
}
