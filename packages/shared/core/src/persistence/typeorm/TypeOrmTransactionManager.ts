// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "../../decorators/Singleton"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { TransactionManager } from "../TransactionManager"

@Singleton()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return await this.dataSource.transaction(work)
  }
}
