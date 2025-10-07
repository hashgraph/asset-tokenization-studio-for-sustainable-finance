// SPDX-License-Identifier: Apache-2.0

import { IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Min } from 'class-validator'

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
  externalPausesIds?: string[]

  @IsOptional()
  @IsString({ each: true })
  externalControlListsIds?: string[]

  @IsOptional()
  @IsString({ each: true })
  externalKycListsIds?: string[]

  @IsOptional()
  @IsString()
  diamondOwnerAccount?: string

  @IsOptional()
  @IsString()
  complianceId?: string

  @IsOptional()
  @IsString()
  identityRegistryId?: string

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
  resolver: string

  @IsOptional()
  @IsString({ each: true })
  proceedRecipientIds?: string[]

  @IsOptional()
  @IsString({ each: true })
  proceedRecipientsData?: string[]
}
