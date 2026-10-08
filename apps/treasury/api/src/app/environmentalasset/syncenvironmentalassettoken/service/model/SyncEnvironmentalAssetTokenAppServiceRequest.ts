// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class SyncEnvironmentalAssetTokenAppServiceRequest {
  @IsNotEmpty()
  readonly environmentalAssetContractId: string

  @IsNotEmpty()
  readonly fromAccountId: string

  @IsNotEmpty()
  readonly toAccountId: string

  @IsOptional()
  @IsNumber()
  readonly tokenId?: number
}
