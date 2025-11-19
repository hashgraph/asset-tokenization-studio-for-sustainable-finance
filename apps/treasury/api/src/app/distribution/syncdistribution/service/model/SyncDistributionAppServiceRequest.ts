// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber } from "class-validator"

export class SyncDistributionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNumber()
  @IsNotEmpty()
  readonly distributionId: number

  @IsNotEmpty()
  readonly results: { holder: string; status: number; amount: string }[]
}
