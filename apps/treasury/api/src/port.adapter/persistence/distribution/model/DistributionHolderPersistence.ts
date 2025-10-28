// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { DistributionPersistence } from "./DistributionPersistence"

export enum DistributionHolderStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity("DistributionHolder")
export class DistributionHolderPersistence extends BaseEntityPersistence {
  @Column()
  holderAccountId: string

  @Column()
  status: DistributionHolderStatus

  @Column()
  amount: string

  @Column()
  distributionId: number

  @ManyToOne(() => DistributionPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  distribution: DistributionPersistence
}
