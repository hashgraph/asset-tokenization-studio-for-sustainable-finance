// SPDX-License-Identifier: Apache-2.0

export class UpdateFrequencyCommand {
  constructor(
    public readonly registryId: string,
    public readonly frequencyMinutes: number,
  ) {}
}
