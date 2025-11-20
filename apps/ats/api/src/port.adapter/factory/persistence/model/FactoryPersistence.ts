// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("Factory")
export class FactoryPersistence {
  @PrimaryColumn()
  factoryId: string

  @Column({ default: false })
  isPaused: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
