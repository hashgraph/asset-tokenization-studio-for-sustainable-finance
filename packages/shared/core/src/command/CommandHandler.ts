// SPDX-License-Identifier: Apache-2.0

import { Command } from "./Command"

export interface CommandHandler<C extends Command<R>, R> {
  execute(command: C): Promise<R>
}
