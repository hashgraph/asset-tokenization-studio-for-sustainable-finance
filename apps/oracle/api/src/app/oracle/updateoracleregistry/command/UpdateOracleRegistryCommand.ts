// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsDate, IsOptional, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

export class UpdateOracleRegistryCommand extends Command<OracleRegistry> {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  schedulerStartDate?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  schedulerEndDate?: Date | null

  @IsOptional()
  @IsNumber()
  @Min(1)
  frequencyMinutes?: number

  constructor(id: string, schedulerStartDate?: Date, schedulerEndDate?: Date | null, frequencyMinutes?: number) {
    super()
    this.id = id
    this.schedulerStartDate = schedulerStartDate
    this.schedulerEndDate = schedulerEndDate
    this.frequencyMinutes = frequencyMinutes
  }
}
