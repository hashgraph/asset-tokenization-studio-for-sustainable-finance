// SPDX-License-Identifier: Apache-2.0

import { NestJSCommandBus } from "./command/NestJSCommandBus"
import { NestJSQueryBus } from "./query/NestJSQueryBus"
import { NestJSEventBus } from "./event/NestJSEventBus"
import { RetryService } from "./retry/RetryService"

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
  RetryService,
]
