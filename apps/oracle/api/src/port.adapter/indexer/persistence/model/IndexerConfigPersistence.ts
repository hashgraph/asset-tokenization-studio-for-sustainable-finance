// SPDX-License-Identifier: Apache-2.0
import { Entity, Column } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("IndexerConfig")
export class IndexerConfigPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 500 })
  endpoint: string

  @Column({ type: "varchar", length: 500 })
  apiKey: string
}
