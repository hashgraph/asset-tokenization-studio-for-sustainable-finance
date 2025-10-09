import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class EnvironmentalAsset extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryId: string

  deletedAt?: Date
}
