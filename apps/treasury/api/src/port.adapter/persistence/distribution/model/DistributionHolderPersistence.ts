// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { DistributionPersistence } from "./DistributionPersistence"

@Entity("DistributionHolder")
export class DistributionHolderPersistence extends BaseEntityPersistence {
  @Column()
  holderAccountId: string

  @Column()
  status: string

  @Column({ nullable: true })
  amount?: string

  @Column()
  distributionId: number

  @Column()
  paymentTokenId: string

  @ManyToOne(() => DistributionPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  distribution: DistributionPersistence
}
