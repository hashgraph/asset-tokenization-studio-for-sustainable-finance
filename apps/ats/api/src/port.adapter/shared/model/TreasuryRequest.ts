// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class TreasuryRequest {
  @IsString()
  @IsNotEmpty()
  resolverAddress: string

  @IsString()
  @IsNotEmpty()
  configId: string

  @IsNumber()
  configVersion: number

  @IsString()
  @IsNotEmpty()
  paymentTokenAddress: string

  @IsString()
  @IsNotEmpty()
  ownerAccountAddress: string

  @IsString({ each: true })
  environmentalAssetsAddresses: string[]
}
