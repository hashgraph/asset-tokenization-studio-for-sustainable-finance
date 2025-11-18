// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, Min } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

export class UpdateFrequencyCommand extends Command<OracleRegistry> {
  @IsNotEmpty()
  @IsString()
  registryId: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  frequencyMinutes: number

  constructor(registryId: string, frequencyMinutes: number) {
    super()
    this.registryId = registryId
    this.frequencyMinutes = frequencyMinutes
  }
}
