// SPDX-License-Identifier: Apache-2.0

import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { BaseEntity } from "./BaseEntity"

export abstract class BaseEntityPersistence {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  static fromEntity<T extends BaseEntity, P extends BaseEntityPersistence>(entity: T, entityPersistence: P): P {
    entityPersistence.id = entity.id
    entityPersistence.createdAt = entity.createdAt
    entityPersistence.updatedAt = entity.updatedAt
    return entityPersistence
  }
}
