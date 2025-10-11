// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, Min, IsDate } from "class-validator"
import { Type } from "class-transformer"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateBondCommand extends Command<void> {
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

  @IsString()
  @IsNotEmpty()
  nominalValue: string

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startingDate: Date

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  maturityDate: Date

  @IsString()
  @IsNotEmpty()
  maxSupply: string

  constructor(
    contractId: string,
    treasuryId: string,
    kpiId: string,
    name: string,
    symbol: string,
    decimals: number,
    currency: string,
    nominalValue: string,
    startingDate: Date,
    maturityDate: Date,
    maxSupply: string,
    isin: string,
  ) {
    super()
    this.contractId = contractId
    this.treasuryId = treasuryId
    this.kpiId = kpiId
    this.name = name
    this.symbol = symbol
    this.isin = isin
    this.decimals = decimals
    this.currency = currency
    this.nominalValue = nominalValue
    this.startingDate = startingDate
    this.maturityDate = maturityDate
    this.maxSupply = maxSupply
  }
}
