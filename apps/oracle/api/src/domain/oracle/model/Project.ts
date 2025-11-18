// SPDX-License-Identifier: Apache-2.0

/**
 * Project Value Object
 * Represents a project with its associated topic ID for KPI retrieval
 */
export class Project {
  constructor(
    public readonly projectId: string,
    public readonly topicId: string,
  ) {
    if (!projectId || projectId.trim().length === 0) {
      throw new Error("Project ID cannot be empty");
    }
    if (!topicId || topicId.trim().length === 0) {
      throw new Error("Topic ID cannot be empty");
    }
  }

  equals(other: Project): boolean {
    return this.projectId === other.projectId && this.topicId === other.topicId;
  }

  toJSON() {
    return {
      projectId: this.projectId,
      topicId: this.topicId,
    };
  }

  static fromJSON(data: { projectId: string; topicId: string }): Project {
    return new Project(data.projectId, data.topicId);
  }
}
