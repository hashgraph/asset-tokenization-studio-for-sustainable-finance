// SPDX-License-Identifier: Apache-2.0

import { Singleton, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

@Singleton()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return await this.dataSource.transaction(work)
  }
}
