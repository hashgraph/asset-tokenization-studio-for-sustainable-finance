import {BaseBuildTransactionRequest} from "@hashgraph/green-bonds-shared-core"
import {IsNotEmpty, IsString} from "class-validator"

export class BuildSetBondDocumentTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  uri: string

  @IsString()
  @IsNotEmpty()
  hash: string
}
