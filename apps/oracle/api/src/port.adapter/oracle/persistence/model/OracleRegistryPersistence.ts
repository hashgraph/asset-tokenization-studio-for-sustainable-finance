// SPDX-License-Identifier: Apache-2.0
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ScheduledTaskResultPersistence } from "./ScheduledTaskResultPersistence";

export interface ProjectData {
  projectId: string;
  topicId: string;
}

@Entity("oracle_registry")
export class OracleRegistryPersistence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  bondId: string;

  @Column({ type: "varchar", length: 255, unique: true })
  kpiContractId: string;

  @Column({ type: "jsonb" })
  projects: ProjectData[];

  @Column({ type: "timestamp" })
  schedulerStartDate: Date;

  @Column({ type: "timestamp", nullable: true })
  schedulerEndDate: Date | null;

  @Column({ type: "timestamp" })
  nextExecutionDate: Date;

  @Column({ type: "int" })
  frequencyMinutes: number;

  @Column({ type: "varchar", length: 50, default: "ACTIVE" })
  status: string; // ACTIVE, PAUSED, STOPPED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ScheduledTaskResultPersistence,
    (taskResult) => taskResult.oracleRegistry,
  )
  taskResults: ScheduledTaskResultPersistence[];
}
