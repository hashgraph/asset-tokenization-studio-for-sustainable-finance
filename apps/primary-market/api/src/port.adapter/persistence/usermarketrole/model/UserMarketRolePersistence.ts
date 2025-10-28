// SPDX-License-Identifier: Apache-2.0

import { Entity, ManyToOne, JoinColumn, Index } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { UserPersistence } from "@port/persistence/user/model/UserPersistence"
import { RolePersistence } from "@port/persistence/role/model/RolePersistence"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"

@Entity("UserMarketRole")
@Index(["user", "role", "market"], { unique: true })
export class UserMarketRolePersistence extends BaseEntityPersistence {
  @ManyToOne(() => UserPersistence, (user) => user.userMarketRoles, { eager: true })
  @JoinColumn({ name: "userId" })
  user: UserPersistence

  @ManyToOne(() => RolePersistence, (role) => role.userMarketRoles, { eager: true })
  @JoinColumn({ name: "roleId" })
  role: RolePersistence

  @ManyToOne(() => PrimaryMarketPersistence, (market) => market.userMarketRoles, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "marketId" })
  market: PrimaryMarketPersistence
}
