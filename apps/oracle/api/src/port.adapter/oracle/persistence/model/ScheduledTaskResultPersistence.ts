// SPDX-License-Identifier: Apache-2.0
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OracleRegistryPersistence } from "./OracleRegistryPersistence";

@Entity("scheduled_tasks_results")
export class ScheduledTaskResultPersistence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  oracleRegistryId: string;

  @ManyToOne(
    () => OracleRegistryPersistence,
    (registry) => registry.taskResults,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "oracleRegistryId" })
  oracleRegistry: OracleRegistryPersistence;

  @Column({ type: "varchar", length: 255 })
  projectId: string;

  @Column({ type: "timestamp" })
  scheduledTime: Date;

  @Column({ type: "timestamp" })
  executionTime: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date | null;

  @Column({ type: "varchar", length: 50 })
  status: string; // RUNNING, SUCCESS, FAILED

  @Column({ type: "int", default: 0 })
  retryCount: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  errorType: string | null;

  @Column({ type: "text", nullable: true })
  errorMessage: string | null;

  @Column({ type: "decimal", precision: 20, scale: 6, nullable: true })
  kpiValue: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  transactionHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
