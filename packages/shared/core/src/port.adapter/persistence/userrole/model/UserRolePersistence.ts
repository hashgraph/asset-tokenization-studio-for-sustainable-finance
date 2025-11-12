// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@persistence/BaseEntityPersistence"
import { Column, Entity } from "typeorm"

@Entity("UserRole")
export class UserRolePersistence extends BaseEntityPersistence {
  @Column()
  userAccountId: string

  @Column()
  roleId: string

  @Column()
  contractId: string
}
