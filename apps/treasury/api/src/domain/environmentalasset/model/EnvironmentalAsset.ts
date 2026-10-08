import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsInt, IsNotEmpty, IsOptional, Min } from "class-validator"

export class EnvironmentalAsset extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryId: string

  removalDate?: Date

  @IsOptional()
  @IsInt()
  @Min(1)
  dissociationError?: number | null

  clearDissociationError(): void {
    this.dissociationError = null
  }
}
