// SPDX-License-Identifier: Apache-2.0

import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PaymentResultItemAppServiceRequestModel } from "@app/shared/model/PaymentResultItemAppServiceRequestModel"

export class SyncRedemptionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PaymentResultItemAppServiceRequestModel)
  readonly results: PaymentResultItemAppServiceRequestModel[]
}
