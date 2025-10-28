// SPDX-License-Identifier: Apache-2.0

import { Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("Distribution")
export class DistributionPersistence {
  @PrimaryColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
