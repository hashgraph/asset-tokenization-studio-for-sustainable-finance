import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString, IsDefined } from "class-validator"
import { BondAlreadyPausedError } from "@domain/bond/errors/BondAlreadyPausedError"
import { BondAlreadyUnpausedError } from "@domain/bond/errors/BondAlreadyUnpausedError"

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
  @IsNumberString()
  nominalValue: string

  @IsNotEmpty()
  @IsDate()
  startingDate: Date

  @IsNotEmpty()
  @IsDate()
  maturityDate: Date

  @IsNotEmpty()
  @IsNumberString()
  maxSupply: string

  @IsDefined()
  isPaused: boolean = false

  pause(): void {
    if (this.isPaused) {
      throw BondAlreadyPausedError.contractIdError(this.contractId)
    }
    this.isPaused = true
  }

  unpause(): void {
    if (!this.isPaused) {
      throw BondAlreadyUnpausedError.contractIdError(this.contractId)
    }
    this.isPaused = false
  }
}
