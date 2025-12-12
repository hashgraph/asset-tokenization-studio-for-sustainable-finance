import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"

export class BondLock {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsString()
  partition: string

  @IsNotEmpty()
  @IsNumberString()
  amount: string

  @IsNotEmpty()
  @IsDate()
  expirationTimestamp: Date

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
