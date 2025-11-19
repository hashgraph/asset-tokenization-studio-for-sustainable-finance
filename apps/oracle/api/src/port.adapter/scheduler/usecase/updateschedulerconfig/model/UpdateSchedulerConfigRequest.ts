// SPDX-License-Identifier: Apache-2.0
import { IsOptional, IsString, IsInt, IsBoolean, Min } from "class-validator"

export class UpdateSchedulerConfigRequest {
  @IsOptional()
  @IsString()
  cronExpression?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  concurrencyLimit?: number

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
