// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

export interface ProjectData {
  projectId: string;
  topicId: string;
}

export class CreateOracleRegistryCommand extends Command<OracleRegistry> {
  constructor(
    public readonly bondId: string,
    public readonly kpiContractId: string,
    public readonly projects: ProjectData[],
    public readonly schedulerStartDate: Date,
    public readonly schedulerEndDate: Date | null,
    public readonly frequencyMinutes: number,
  ) {
    super();
  }
}
