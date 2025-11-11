// SPDX-License-Identifier: Apache-2.0

import { NestJSCommandBus } from "@command/NestJSCommandBus"
import { NestJSQueryBus } from "@query/NestJSQueryBus"
import { NestJSEventBus } from "@event/NestJSEventBus"
import { RetryPRetryAdapter } from "@retry/RetryPRetryAdapter"
import { UserRoleTypeOrmRepository } from "./port.adapter/persistence/userrole/repositories/UserRoleTypeOrmRepository"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { UserRolePersistence } from "./port.adapter/persistence/userrole/model/UserRolePersistence"
import { GrantRoleTransactionAppService } from "./app/transaction/grantrole/service/GrantRoleTransactionAppService"
import { RevokeRoleTransactionAppService } from "./app/transaction/revokerole/revokerole/service/RevokeRoleTransactionAppService"
import { PauseTransactionAppService } from "./app/transaction/pause/service/PauseTransactionAppService"
import { UnpauseTransactionAppService } from "./app/transaction/unpause/service/UnpauseTransactionAppService"
import { RenounceRoleTransactionAppService } from "./app/transaction/renouncerole/service/RenounceRoleTransactionAppService"
import { GetUserRolesQueryHandler } from "./app/getuserroles/query/GetUserRolesQueryHandler"

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
]

export const COMMON_FUNCTIONALITY_ENTITIES: EntityClassOrSchema[] = [UserRolePersistence]

export const COMMON_FUNCTIONALITY_PROVIDERS = [
  {
    provide: "UserRoleRepository",
    useClass: UserRoleTypeOrmRepository,
  },
  GrantRoleTransactionAppService,
  RevokeRoleTransactionAppService,
  RenounceRoleTransactionAppService,
  PauseTransactionAppService,
  UnpauseTransactionAppService,
  GetUserRolesQueryHandler
]
