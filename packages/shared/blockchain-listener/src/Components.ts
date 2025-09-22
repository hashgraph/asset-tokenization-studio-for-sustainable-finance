// SPDX-License-Identifier: Apache-2.0

import EventListenerAdapter from "./port/adapter/listener/usecase/listenevents/EventListenerAdapter"
import EventListenerNestAdapter from "./port/adapter/usecase/managenestlifecycle/NestLifeCycleAdapter"
import EventFetcherAdapter from "./port/adapter/blockchain/usecase/fetchevents/EventFetcherAdapter"
import DecodeEventAdapter from "./port/adapter/blockchain/usecase/decodeevent/DecodeEventAdapter"
import MirrorNodeQueryAdapter from "./port/adapter/blockchain/usecase/querymirrornode/MirrorNodeQueryAdapter"
import BlockchainEventListenerAppService from "./app/service/BlockchainEventListenerAppService"

export const PROVIDERS = [
  EventListenerAdapter,
  EventListenerNestAdapter,
  EventFetcherAdapter,
  DecodeEventAdapter,
  MirrorNodeQueryAdapter,
  BlockchainEventListenerAppService
]
