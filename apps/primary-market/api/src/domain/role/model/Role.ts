import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class Role extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  hex: string
}
