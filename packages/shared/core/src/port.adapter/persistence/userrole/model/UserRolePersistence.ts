// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@persistence/BaseEntityPersistence"
import { Column, Entity, Index } from "typeorm"

@Entity("UserRole")
@Index(["userAccountId", "roleId", "contractId"], { unique: true })
export class UserRolePersistence extends BaseEntityPersistence {
  @Column()
  userAccountId: string

  @Column()
  roleId: string

  @Column()
  contractId: string
}
