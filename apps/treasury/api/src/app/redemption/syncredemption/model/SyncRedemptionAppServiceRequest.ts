// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class SyncRedemptionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNotEmpty()
  readonly successAddresses: string[]

  @IsNotEmpty()
  readonly failedAddresses: string[]

  @IsNotEmpty()
  readonly paidAmounts: string[]
}
