// SPDX-License-Identifier: Apache-2.0

import { NestJSCommandBus } from "@command/NestJSCommandBus"
import { NestJSQueryBus } from "@query/NestJSQueryBus"
import { NestJSEventBus } from "@event/NestJSEventBus"
import { RetryPRetryAdapter } from "@retry/RetryPRetryAdapter"
import { UserRoleTypeOrmRepository } from "./port.adapter/persistence/userrole/repositories/UserRoleTypeOrmRepository"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { UserRolePersistence } from "./port.adapter/persistence/userrole/model/UserRolePersistence"

export const PROVIDERS = [
  {
    provide: "CommandBus",
    useClass: NestJSCommandBus,
  },
  {
    provide: "QueryBus",
    useClass: NestJSQueryBus,
  },
  {
    provide: "EventBus",
    useClass: NestJSEventBus,
  },
  {
    provide: "RetryPort",
    useClass: RetryPRetryAdapter,
  },
  {
    provide: "UserRoleRepository",
    useClass: UserRoleTypeOrmRepository,
  },
]

export const SHARED_ENTITIES: EntityClassOrSchema[] = [UserRolePersistence]
