// SPDX-License-Identifier: Apache-2.0
import { IsOptional, IsString, IsInt, IsBoolean, Min, Matches } from "class-validator"

export class UpdateSchedulerConfigRequest {
  @IsOptional()
  @IsString()
  @Matches(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6])) (\*|([0-6])|\*\/([0-6]))$/,
    {
      message: "cronExpression must be a valid cron expression (6 fields: second minute hour day month dayOfWeek)",
    },
  )
  cronExpression?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  concurrencyLimit?: number

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
