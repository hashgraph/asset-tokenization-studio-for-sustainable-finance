// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistryPersistence } from "./OracleRegistryPersistence"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"

@Entity("ScheduledTasksResults")
export class ScheduledTaskResultPersistence extends BaseEntityPersistence {
  @Column({ type: "uuid" })
  oracleRegistryId: string

  @ManyToOne(() => OracleRegistryPersistence, (registry) => registry.taskResults, { onDelete: "CASCADE" })
  @JoinColumn({ name: "oracleRegistryId" })
  oracleRegistry: OracleRegistryPersistence

  @Column({ type: "varchar", length: 255 })
  projectId: string

  @Column({ type: "timestamp" })
  scheduledTime: Date

  @Column({ type: "timestamp" })
  executionTime: Date

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date | null

  @Column({ type: "enum", enum: TaskStatus })
  status: TaskStatus

  @Column({ type: "int", default: 0 })
  retryCount: number

  @Column({ type: "varchar", length: 255, nullable: true })
  errorType: string | null

  @Column({ type: "text", nullable: true })
  errorMessage: string | null

  @Column({ type: "decimal", precision: 20, scale: 6, nullable: true })
  kpiValue: number | null

  @Column({ type: "varchar", length: 255, nullable: true })
  transactionHash: string | null
}
