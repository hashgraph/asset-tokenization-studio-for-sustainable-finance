// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber } from "class-validator"

export class SyncDistributionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNumber()
  @IsNotEmpty()
  readonly distributionId: number

  @IsNotEmpty()
  readonly successAddresses: string[]

  @IsNotEmpty()
  readonly failedAddresses: string[]

  @IsNotEmpty()
  readonly paidAmounts: string[]
}
