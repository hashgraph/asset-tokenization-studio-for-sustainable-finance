// SPDX-License-Identifier: Apache-2.0

import { applyDecorators } from "@nestjs/common"
import { CommandHandler, QueryHandler } from "@nestjs/cqrs"

export function Handler(handleable: any) {
  return applyDecorators(handleable.name.endsWith("Command") ? CommandHandler(handleable) : QueryHandler(handleable))
}
