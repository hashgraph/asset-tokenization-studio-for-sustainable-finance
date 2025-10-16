// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber } from "class-validator"

export class AddEnvironmentalAssetTransferAppServiceRequest {
  @IsNotEmpty()
  readonly environmentalAssetContractId: string

  @IsNotEmpty()
  readonly fromAccountId: string

  @IsNotEmpty()
  readonly toAccountId: string

  @IsNumber()
  readonly tokenId?: number
}
