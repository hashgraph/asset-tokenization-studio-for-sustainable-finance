// SPDX-License-Identifier: Apache-2.0
import { Entity, Column } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("BlockchainConfig")
export class BlockchainConfigPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 50 })
  network: string

  @Column({ type: "varchar", length: 500 })
  rpcEndpoint: string

  @Column({ type: "boolean", default: false })
  useJsonRpc: boolean
}
