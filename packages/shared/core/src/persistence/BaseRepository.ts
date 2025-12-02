// SPDX-License-Identifier: Apache-2.0

import { EntityManager } from "typeorm/entity-manager/EntityManager"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { BaseEntityPersistence } from "@persistence/BaseEntityPersistence"

export abstract class BaseRepository<E extends BaseEntityPersistence> {
  @InjectDataSource()
  private readonly dataSource: DataSource

  protected constructor(private readonly persistenceClass: new () => E) {}

  getRepository(transactionId?: string) {
    const entityManager: EntityManager =
      transactionId && globalThis.transactions[transactionId]
        ? globalThis.transactions[transactionId]
        : this.dataSource.manager
    return entityManager.getRepository(this.persistenceClass)
  }
}
