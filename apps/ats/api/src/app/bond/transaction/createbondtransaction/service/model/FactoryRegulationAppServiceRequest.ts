// SPDX-License-Identifier: Apache-2.0

import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"

export class FactoryRegulationAppServiceRequest {
  @IsNumber()
  regulationType: number

  @IsNumber()
  regulationSubType: number

  @IsBoolean()
  isCountryControlListWhiteList: boolean

  @IsOptional()
  @IsString()
  countries?: string

  @IsOptional()
  @IsString()
  info?: string
}
