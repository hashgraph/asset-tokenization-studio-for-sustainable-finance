// SPDX-License-Identifier: Apache-2.0

export class UpdateProjectTopicCommand {
  constructor(
    public readonly registryId: string,
    public readonly projectId: string,
    public readonly topicId: string,
  ) {}
}
