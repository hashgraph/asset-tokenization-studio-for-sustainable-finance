// SPDX-License-Identifier: Apache-2.0
import {IsNotEmpty, IsString} from "class-validator"

export class SetBondDocumentDomainServiceRequest {
  @IsString()
  contractId: string

  @IsString()
  name: string

  @IsString()
  uri: string

  @IsString()
  @IsNotEmpty()
  hash: string
}
