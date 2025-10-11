// SPDX-License-Identifier: Apache-2.0

import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class FactoryRegulationAppServiceRequest {
  @IsNumber()
  regulationType: number

  @IsNumber()
  regulationSubType: number

  @IsBoolean()
  isCountryControlListWhiteList: boolean

  @IsString()
  @IsNotEmpty()
  countries: string

  @IsString()
  @IsNotEmpty()
  info: string
}
