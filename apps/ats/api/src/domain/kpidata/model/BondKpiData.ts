// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class BondKpiData extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  project: string

  @IsNotEmpty()
  @IsNumberString()
  date: string

  @IsNotEmpty()
  @IsNumberString()
  value: string
}
