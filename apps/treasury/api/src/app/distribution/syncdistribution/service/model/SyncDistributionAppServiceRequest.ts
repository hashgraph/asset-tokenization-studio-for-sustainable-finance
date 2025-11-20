// SPDX-License-Identifier: Apache-2.0

import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PaymentResultItemAppServiceRequestModel } from "@app/shared/model/PaymentResultItemAppServiceRequestModel"

export class SyncDistributionAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNumber()
  @IsNotEmpty()
  readonly distributionId: number

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PaymentResultItemAppServiceRequestModel)
  readonly results: PaymentResultItemAppServiceRequestModel[]
}
