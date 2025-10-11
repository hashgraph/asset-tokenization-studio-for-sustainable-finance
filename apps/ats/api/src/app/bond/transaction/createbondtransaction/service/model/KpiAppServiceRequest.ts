// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"

export class KpiAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  adminAddress: string

  @IsString()
  @IsNotEmpty()
  ownerAccountAddress: string
}
