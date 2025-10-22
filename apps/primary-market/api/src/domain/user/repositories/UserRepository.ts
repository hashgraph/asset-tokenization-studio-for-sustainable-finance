// SPDX-License-Identifier: Apache-2.0

import { User } from "../model/User"

export interface UserRepository {
  save(user: User): Promise<User>
  findByAccountId(accountId: string): Promise<User | null>
}
