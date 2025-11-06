// SPDX-License-Identifier: Apache-2.0

import { ArrayMinSize, IsNotEmpty } from "class-validator"

export class SyncTreasuryAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNotEmpty()
  readonly bondContractId: string

  @IsNotEmpty()
  readonly paymentToken: string

  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  readonly environmentalAssets: string[]
}
