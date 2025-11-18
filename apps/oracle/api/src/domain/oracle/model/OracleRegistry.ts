// SPDX-License-Identifier: Apache-2.0
import { randomUUID } from "crypto"
import { Project } from "./Project"
import { OracleConfig } from "./OracleConfig"
import { OracleStatus } from "./OracleStatus"
import { ProjectFoundError } from "../errors/ProjectFoundError"
import { ProjectNotFoundError } from "../errors/ProjectNotFoundError"
import { OracleRegistryStateError } from "../errors/OracleRegistryStateError"

/**
 * OracleRegistry Aggregate Root
 * Manages the lifecycle and configuration of an oracle registry
 */
export class OracleRegistry {
  constructor(
    public readonly id: string,
    public readonly bondContractId: string,
    public readonly kpiContractId: string,
    private _projects: Project[],
    private _config: OracleConfig,
    private _status: OracleStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get projects(): Project[] {
    return [...this._projects]
  }

  get config(): OracleConfig {
    return this._config
  }

  get status(): OracleStatus {
    return this._status
  }

  addProject(project: Project): void {
    const exists = this._projects.some((p) => p.projectId === project.projectId)
    if (exists) {
      throw ProjectFoundError.projectIdError(project.projectId, this.id)
    }
    this._projects.push(project)
  }

  removeProject(projectId: string): void {
    const index = this._projects.findIndex((p) => p.projectId === projectId)
    if (index === -1) {
      throw ProjectNotFoundError.projectIdError(projectId, this.id)
    }
    this._projects.splice(index, 1)
  }

  updateProjectTopic(projectId: string, newTopicId: string): void {
    const index = this._projects.findIndex((p) => p.projectId === projectId)
    if (index === -1) {
      throw ProjectNotFoundError.projectIdError(projectId, this.id)
    }
    this._projects[index] = new Project(projectId, newTopicId)
  }

  getProjectById(projectId: string): Project | undefined {
    return this._projects.find((p) => p.projectId === projectId)
  }

  updateSchedulerDates(startDate?: Date, endDate?: Date | null): void {
    this._config = this._config.withUpdatedDates(startDate, endDate)
  }

  updateNextExecutionDate(date: Date): void {
    this._config = this._config.withNextExecutionDate(date)
  }

  pause(): void {
    if (this._status === OracleStatus.STOPPED) {
      throw OracleRegistryStateError.cannotPauseStoppedRegistry()
    }
    this._status = OracleStatus.PAUSED
  }

  resume(): void {
    if (this._status === OracleStatus.STOPPED) {
      throw OracleRegistryStateError.cannotResumeStoppedRegistry()
    }
    this._status = OracleStatus.ACTIVE
  }

  stop(): void {
    this._status = OracleStatus.STOPPED
  }

  canExecute(): boolean {
    return this._status === OracleStatus.ACTIVE && this._config.shouldExecuteNow()
  }

  updateFrequency(frequencyMinutes: number): void {
    this._config = this._config.withUpdatedFrequency(frequencyMinutes)
  }

  static create(
    bondContractId: string,
    kpiContractId: string,
    projects: Project[],
    schedulerStartDate: Date,
    schedulerEndDate: Date | null,
    frequencyMinutes: number,
  ): OracleRegistry {
    if (projects.length === 0) {
      throw OracleRegistryStateError.atLeastOneProjectRequired()
    }

    const config = new OracleConfig(
      schedulerStartDate,
      schedulerEndDate,
      schedulerStartDate, // Initial next execution is the start date
      frequencyMinutes,
    )

    return new OracleRegistry(
      randomUUID(),
      bondContractId,
      kpiContractId,
      projects,
      config,
      OracleStatus.ACTIVE,
      new Date(),
      new Date(),
    )
  }
}
