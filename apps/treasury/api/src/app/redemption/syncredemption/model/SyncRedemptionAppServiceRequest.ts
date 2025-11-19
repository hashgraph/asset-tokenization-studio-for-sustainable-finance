// SPDX-License-Identifier: Apache-2.0

import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PaymentResultItemModel } from "@port/shared/model/PaymentResultItemModel"

export class SyncRedemptionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PaymentResultItemModel)
  readonly results: PaymentResultItemModel[]
}
