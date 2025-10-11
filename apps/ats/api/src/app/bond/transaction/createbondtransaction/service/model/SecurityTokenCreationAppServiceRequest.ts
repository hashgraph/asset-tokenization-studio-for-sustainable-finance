// SPDX-License-Identifier: Apache-2.0

import { IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Min } from "class-validator"

export class SecurityTokenCreationAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  symbol: string

  @IsString()
  @IsNotEmpty()
  isin: string

  @IsNumber()
  @Min(0)
  decimals: number

  @IsBoolean()
  isWhiteList: boolean

  @IsBoolean()
  erc20VotesActivated: boolean

  @IsBoolean()
  isControllable: boolean

  @IsBoolean()
  arePartitionsProtected: boolean

  @IsBoolean()
  isMultiPartition: boolean

  @IsBoolean()
  clearingActive: boolean

  @IsBoolean()
  internalKycActivated: boolean

  @IsOptional()
  @IsString({ each: true })
  externalPausesAddresses?: string[]

  @IsOptional()
  @IsString({ each: true })
  externalControlListsAddresses?: string[]

  @IsOptional()
  @IsString({ each: true })
  externalKycListsAddresses?: string[]

  @IsOptional()
  @IsString()
  diamondOwnerAccountAddress?: string

  @IsOptional()
  @IsString()
  complianceAddress?: string

  @IsOptional()
  @IsString()
  identityRegistryAddress?: string

  @IsString()
  @IsNotEmpty()
  currency: string

  @IsString()
  @IsNotEmpty()
  numberOfUnits: string

  @IsString()
  @IsNotEmpty()
  nominalValue: string

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  startingDate: string

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  maturityDate: string

  @IsString()
  @IsNotEmpty()
  configId: string

  @IsNumber()
  configVersion: number

  @IsString()
  @IsNotEmpty()
  resolverAddress: string

  @IsOptional()
  @IsString({ each: true })
  proceedRecipientAddresses?: string[]

  @IsOptional()
  @IsString({ each: true })
  proceedRecipientsData?: string[]
}
