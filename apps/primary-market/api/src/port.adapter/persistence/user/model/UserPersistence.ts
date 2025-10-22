// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, OneToMany } from "typeorm"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("User")
export class UserPersistence extends BaseEntityPersistence {
  @Column({ unique: true })
  accountId: string

  @OneToMany(() => UserMarketRolePersistence, (umr) => umr.user)
  userMarketRoles: UserMarketRolePersistence[]
}
