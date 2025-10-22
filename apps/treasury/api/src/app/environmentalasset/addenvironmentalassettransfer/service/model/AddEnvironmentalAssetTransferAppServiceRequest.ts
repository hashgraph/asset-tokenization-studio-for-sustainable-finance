// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"

export class AddEnvironmentalAssetTransferAppServiceRequest {
  @IsNotEmpty()
  readonly environmentalAssetContractId: string

  @IsNotEmpty()
  readonly fromAccountId: string

  @IsNotEmpty()
  readonly toAccountId: string

  readonly tokenId?: number
}
