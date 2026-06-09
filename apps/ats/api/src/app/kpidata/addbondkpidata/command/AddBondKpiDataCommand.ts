// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class AddBondKpiDataCommand extends Command<void> {
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

  constructor(bondContractId: string, project: string, date: string, value: string) {
    super()
    this.bondContractId = bondContractId
    this.project = project
    this.date = date
    this.value = value
  }
}
