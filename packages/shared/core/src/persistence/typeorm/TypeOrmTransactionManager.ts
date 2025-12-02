// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "../../decorators/Singleton"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { TransactionManager } from "../TransactionManager"
import { randomUUID } from "crypto"

@Singleton()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    globalThis.transactions = {}
  }

  async execute<T>(work: (transactionId: string) => Promise<T>): Promise<T> {
    return await this.dataSource.transaction(async (entityManager) => {
      const transactionId = randomUUID()
      globalThis.transactions[transactionId] = entityManager
      const result = await work(transactionId)
      delete globalThis.transactions[transactionId]
      return result
    })
  }
}
