// SPDX-License-Identifier: Apache-2.0

import EventListenerAdapter from "./port/adapter/listener/EventListenerAdapter"
import EventListenerNestAdapter from "./port/adapter/EventListenerNestAdapter"
import EventFetcherAdapter from "./port/adapter/blockchain/EventFetcherAdapter"
import BlockchainEventListenerAppService from "./app/service/BlockchainEventListenerAppService"

export const PROVIDERS = [
  EventFetcherAdapter,
  EventListenerAdapter,
  EventListenerNestAdapter,
  BlockchainEventListenerAppService,
]
