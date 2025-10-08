import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class EnvironmentalAsset extends BaseEntity {
  @IsNotEmpty()
  assetId: string

  @IsNotEmpty()
  treasuryId: string

  deletedAt?: Date
}
