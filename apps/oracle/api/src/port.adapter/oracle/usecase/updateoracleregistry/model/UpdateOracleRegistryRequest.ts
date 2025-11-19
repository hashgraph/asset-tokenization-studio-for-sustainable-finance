// SPDX-License-Identifier: Apache-2.0
import { IsOptional, IsString, IsNumber, Min } from "class-validator"

export class UpdateOracleRegistryRequest {
  @IsOptional()
  @IsString()
  schedulerStartDate?: string

  @IsOptional()
  @IsString()
  schedulerEndDate?: string | null

  @IsOptional()
  @IsNumber()
  @Min(1)
  frequencyMinutes?: number
}
