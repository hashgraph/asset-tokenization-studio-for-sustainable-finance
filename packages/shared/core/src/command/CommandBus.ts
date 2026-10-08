// SPDX-License-Identifier: Apache-2.0

import { Command } from "./Command"

export interface CommandBus {
  execute<C extends Command<R>, R>(command: C): Promise<R>
}
