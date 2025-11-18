// SPDX-License-Identifier: Apache-2.0
import { IsOptional, IsString } from "class-validator";

export class UpdateOracleRegistryRequest {
  @IsOptional()
  @IsString()
  schedulerStartDate?: string;

  @IsOptional()
  @IsString()
  schedulerEndDate?: string | null;
}
