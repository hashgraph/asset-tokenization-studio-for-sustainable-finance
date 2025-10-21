import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class User extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  accountId: string
}
