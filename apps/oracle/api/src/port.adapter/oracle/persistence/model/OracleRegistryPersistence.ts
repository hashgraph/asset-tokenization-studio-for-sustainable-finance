// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { ScheduledTaskResultPersistence } from "./ScheduledTaskResultPersistence"
import { OracleStatus } from "@domain/oracle/model/OracleStatus"

export interface ProjectData {
  projectId: string
  topicId: string
}

@Entity("OracleRegistry")
export class OracleRegistryPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  bondContractId: string

  @Column({ type: "varchar", length: 255, unique: true })
  kpiContractId: string

  @Column({ type: "jsonb" })
  projects: ProjectData[]

  @Column({ type: "timestamp" })
  schedulerStartDate: Date

  @Column({ type: "timestamp", nullable: true })
  schedulerEndDate: Date | null

  @Column({ type: "timestamp" })
  nextExecutionDate: Date

  @Column({ type: "int" })
  frequencyMinutes: number

  @Column({ type: "enum", enum: OracleStatus, default: OracleStatus.ACTIVE })
  status: OracleStatus

  @OneToMany(() => ScheduledTaskResultPersistence, (taskResult) => taskResult.oracleRegistry)
  taskResults: ScheduledTaskResultPersistence[]
}
