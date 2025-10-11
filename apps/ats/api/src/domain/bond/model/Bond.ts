import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator"

export class Bond extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  treasuryId: string

  @IsNotEmpty()
  @IsString()
  kpiId: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  symbol: string

  @IsNotEmpty()
  @IsString()
  isin: string

  @IsNotEmpty()
  @IsNumber()
  decimals: number

  @IsNotEmpty()
  @IsString()
  currency: string

  @IsNotEmpty()
  @IsString()
  nominalValue: string

  @IsNotEmpty()
  @IsDate()
  startingDate: Date

  @IsNotEmpty()
  @IsDate()
  maturityDate: Date

  @IsNotEmpty()
  @IsString()
  maxSupply: string
}
