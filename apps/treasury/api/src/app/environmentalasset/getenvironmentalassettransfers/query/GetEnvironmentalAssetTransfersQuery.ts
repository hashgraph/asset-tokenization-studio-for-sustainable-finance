// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsEnum } from "class-validator"
import { Type } from "class-transformer"
import { EnvironmentalAssetTransferQueryResponse } from "./EnvironmentalAssetTransferQueryResponse"
import { TransferType } from "@domain/shared/model/TransferType"

export class GetEnvironmentalAssetTransfersQuery extends Query<
  QueryPageResponse<EnvironmentalAssetTransferQueryResponse>
> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  readonly environmentalAssetContractId: string

  @IsOptional()
  @IsEnum(TransferType)
  readonly type?: TransferType

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    treasuryContractId: string,
    environmentalAssetContractId: string,
    type: TransferType | undefined,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.treasuryContractId = treasuryContractId
    this.environmentalAssetContractId = environmentalAssetContractId
    this.type = type
    this.pageOptions = pageOptions
  }
}
