// SPDX-License-Identifier: Apache-2.0

export class RemoveProjectCommand {
  constructor(
    public readonly registryId: string,
    public readonly projectId: string,
  ) {}
}
