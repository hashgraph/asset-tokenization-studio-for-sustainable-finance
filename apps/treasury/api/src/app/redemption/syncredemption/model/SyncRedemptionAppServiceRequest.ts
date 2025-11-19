// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class SyncRedemptionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNotEmpty()
  readonly results: { holder: string; status: number; amount: string }[]
}
