// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, Min, IsDate, IsNumberString } from "class-validator"
import { Type } from "class-transformer"

export class CreateBondDomainServiceRequest {
  @IsString()
  contractId: string

  @IsString()
  treasuryId: string

  @IsString()
  kpiId: string

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

  @IsString()
  @IsNotEmpty()
  currency: string

  @IsNumberString()
  @IsNotEmpty()
  nominalValue: string

  @IsNumber()
  @Min(0)
  nominalValueDecimals: number

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startingDate: Date

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  maturityDate: Date

  @IsNumberString()
  @IsNotEmpty()
  maxSupply: string
}
