// SPDX-License-Identifier: Apache-2.0

export class RetryFailedExecutionCommand {
  constructor(
    public readonly registryId: string,
    public readonly executionId: string,
  ) {}
}
