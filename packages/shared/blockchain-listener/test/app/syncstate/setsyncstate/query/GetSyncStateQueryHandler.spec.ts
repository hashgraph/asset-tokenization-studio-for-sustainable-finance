// SPDX-License-Identifier: Apache-2.0

import { INestApplication } from "@nestjs/common"
import { App } from "supertest/types"
import { Test, TestingModule } from "@nestjs/testing"
import { ENTITIES, PostgresModule } from "../../../../shared/PostgresModule"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { Repository } from "typeorm"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import {
  QueryBus,
  SharedModule
} from "@hashgraph/green-bonds-shared-core"
import { GetSyncStateQuery } from "@app/syncstate/getsyncstate/query/GetSyncStateQuery"
import { PROVIDERS } from "../../../../../src/Components"

describe("SetSyncStateCommandHandler", () => {
  let app: INestApplication<App>
  let container: PostgreSqlContainer
  let internalSyncStateRepository: Repository<SyncStatePersistence>
  let queryBus: QueryBus

  beforeEach(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig(), ENTITIES)],
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    internalSyncStateRepository = app.get(getRepositoryToken(SyncStatePersistence))
    queryBus = app.get("QueryBus")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalSyncStateRepository.deleteAll()
  })

  it("should get sync state when there is no lastBlockNumber", async () => {
    const query = new GetSyncStateQuery()
    const syncState = await queryBus.execute(query)
    expect(syncState).toBeUndefined();
  })
})
