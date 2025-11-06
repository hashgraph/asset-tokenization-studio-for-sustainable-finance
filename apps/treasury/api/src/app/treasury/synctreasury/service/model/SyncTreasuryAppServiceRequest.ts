// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class SyncTreasuryAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNotEmpty()
  readonly bondContractId: string

  @IsNotEmpty()
  readonly paymentToken: string

  @IsNotEmpty()
  readonly environmentalAssets: string[]
}
