// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"

@Entity("PrimaryMarket")
export class PrimaryMarketPersistence extends BaseEntityPersistence {
  @Column({ unique: true })
  contractId: string

  @Column({ default: false })
  isPaused: boolean

  @OneToMany(() => UserMarketRolePersistence, (umr) => umr.market, { cascade: true })
  userMarketRoles: UserMarketRolePersistence[]

  @OneToMany(() => OfferingPersistence, (offering) => offering.market, { cascade: true })
  offerings: OfferingPersistence[]
}
