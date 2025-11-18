// SPDX-License-Identifier: Apache-2.0
import { IsNumber, Min } from "class-validator";

export class UpdateFrequencyRequest {
  @IsNumber()
  @Min(1)
  frequencyMinutes: number;
}
