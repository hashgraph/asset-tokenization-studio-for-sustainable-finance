// SPDX-License-Identifier: Apache-2.0
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, Min } from "class-validator"
import { Type } from "class-transformer"
import { ProjectRequest } from "@port/shared/model/ProjectRequest"

export class CreateOracleRegistryRequest {
  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  kpiContractId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectRequest)
  projects: ProjectRequest[]

  @IsString()
  @IsNotEmpty()
  schedulerStartDate: string

  @IsOptional()
  @IsString()
  schedulerEndDate?: string | null

  @IsNumber()
  @Min(1)
  frequencyMinutes: number
}
