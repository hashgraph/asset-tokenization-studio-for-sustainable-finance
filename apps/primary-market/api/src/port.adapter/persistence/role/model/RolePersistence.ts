import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"

@Entity("Role")
export class RolePersistence extends BaseEntityPersistence {
  @Column({ unique: true })
  hex: string

  @OneToMany(() => UserMarketRolePersistence, (umr) => umr.role)
  userMarketRoles: UserMarketRolePersistence[]
}
