// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"

export class RemoveBondDocumentDomainServiceRequest {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  name: string
}
