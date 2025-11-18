// SPDX-License-Identifier: Apache-2.0
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, ValidateNested, IsDateString, IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class ProjectDto {
  @ApiProperty({ example: "project-001" })
  @IsString()
  projectId: string;

  @ApiProperty({ example: "0.0.111" })
  @IsString()
  topicId: string;
}

export class CreateOracleRegistryDto {
  @ApiProperty({ example: "0.0.12345" })
  @IsString()
  bondId: string;

  @ApiProperty({ example: "0.0.67890" })
  @IsString()
  kpiContractId: string;

  @ApiProperty({ type: [ProjectDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects: ProjectDto[];

  @ApiProperty({ example: "2025-11-20T00:00:00Z" })
  @IsDateString()
  schedulerStartDate: string;

  @ApiProperty({ example: "2026-11-20T00:00:00Z", required: false })
  @IsOptional()
  @IsDateString()
  schedulerEndDate?: string;

  @ApiProperty({
    example: 5,
    description: "Frequency in minutes to fetch KPI values (e.g., 5 = every 5 minutes)"
  })
  @IsNumber()
  frequencyMinutes: number;
}
