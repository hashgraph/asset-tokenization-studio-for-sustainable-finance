import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator"

export class PaymentToken extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryId: string

  @IsNumber()
  @Min(0)
  decimals: number

  removalDate?: Date

  @IsOptional()
  @IsInt()
  @Min(1)
  dissociationError?: number
}
