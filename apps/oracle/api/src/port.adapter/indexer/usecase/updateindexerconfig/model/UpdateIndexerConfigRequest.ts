// SPDX-License-Identifier: Apache-2.0
import { IsOptional, IsString, IsUrl } from "class-validator"

export class UpdateIndexerConfigRequest {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: "endpoint must be a valid URL" })
  endpoint?: string

  @IsOptional()
  @IsString()
  apiKey?: string
}
