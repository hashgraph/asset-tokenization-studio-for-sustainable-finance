// SPDX-License-Identifier: Apache-2.0

import { NestJSCommandBus } from "./command/NestJSCommandBus"
import { NestJSQueryBus } from "./query/NestJSQueryBus"
import { NestJSEventBus } from "./event/NestJSEventBus"

export const PROVIDERS = [
  {
    provide: "CommandBus",
    useValue: NestJSCommandBus,
  },
  {
    provide: "QueryBus",
    useValue: NestJSQueryBus,
  },
  {
    provide: "EventBus",
    useValue: NestJSEventBus,
  },
]
