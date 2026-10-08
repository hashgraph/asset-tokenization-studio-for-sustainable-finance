// SPDX-License-Identifier: Apache-2.0

import { applyDecorators } from "@nestjs/common"
import { CommandHandler, QueryHandler } from "@nestjs/cqrs"
import { OnEvent } from "@nestjs/event-emitter"

export function Handler(handleable: any) {
  let decorator
  if (handleable.name.endsWith("Command")) {
    decorator = CommandHandler(handleable)
  } else if (handleable.name.endsWith("Query")) {
    decorator = QueryHandler(handleable)
  } else {
    decorator = OnEvent(handleable.name, { suppressErrors: false })
  }
  return applyDecorators(decorator)
}
