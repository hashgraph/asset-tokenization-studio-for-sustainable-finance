// SPDX-License-Identifier: Apache-2.0
import {BaseTransactionRequest} from "@hashgraph/green-bonds-shared-core"
import {IsNotEmpty, IsString} from "class-validator"
import {IsBytes32} from "../../../../../../utils/IsBytes32";

export class SetBondDocumentTransactionAppServiceRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  contractId: string

  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  name: string

  @IsString()
  @IsNotEmpty()
  uri: string

  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  hash: string

  constructor(format: string, accountId: string, contractId: string, name: string, uri: string, hash: string) {
    super(format, accountId);
    this.contractId = contractId;
    this.name = name;
    this.uri = uri;
    this.hash = hash;
  }
}
