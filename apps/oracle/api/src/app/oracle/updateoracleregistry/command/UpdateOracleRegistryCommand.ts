// SPDX-License-Identifier: Apache-2.0

export class UpdateOracleRegistryCommand {
  constructor(
    public readonly id: string,
    public readonly schedulerStartDate?: Date,
    public readonly schedulerEndDate?: Date | null,
  ) {}
}
