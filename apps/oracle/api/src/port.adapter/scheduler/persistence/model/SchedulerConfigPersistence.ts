// SPDX-License-Identifier: Apache-2.0
import { Entity, Column } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("scheduler_config")
export class SchedulerConfigPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 100 })
  cronExpression: string

  @Column({ type: "int" })
  concurrencyLimit: number

  @Column({ type: "boolean", default: true })
  enabled: boolean
}
