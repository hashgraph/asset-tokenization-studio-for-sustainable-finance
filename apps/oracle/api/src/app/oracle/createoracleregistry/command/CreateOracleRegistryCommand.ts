// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsArray, IsDate, IsNumber, Min, ValidateNested, IsOptional } from "class-validator"
import { Type } from "class-transformer"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

export class ProjectData {
  @IsNotEmpty()
  @IsString()
  projectId: string

  @IsNotEmpty()
  @IsString()
  topicId: string
}

export class CreateOracleRegistryCommand extends Command<OracleRegistry> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  kpiContractId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectData)
  projects: ProjectData[]

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  schedulerStartDate: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  schedulerEndDate: Date | null

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  frequencyMinutes: number

  constructor(
    bondContractId: string,
    kpiContractId: string,
    projects: ProjectData[],
    schedulerStartDate: Date,
    schedulerEndDate: Date | null,
    frequencyMinutes: number,
  ) {
    super()
    this.bondContractId = bondContractId
    this.kpiContractId = kpiContractId
    this.projects = projects
    this.schedulerStartDate = schedulerStartDate
    this.schedulerEndDate = schedulerEndDate
    this.frequencyMinutes = frequencyMinutes
  }
}
