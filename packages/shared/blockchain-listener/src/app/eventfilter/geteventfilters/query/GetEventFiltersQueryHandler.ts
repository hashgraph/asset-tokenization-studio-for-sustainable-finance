// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetEventFiltersQuery } from "@app/eventfilter/geteventfilters/query/GetEventFiltersQuery"
import { GetEventFiltersQueryResponse } from "@app/eventfilter/geteventfilters/query/GetEventFiltersQueryResponse"
import type { EventFilterRepository } from "@domain/eventfilter/repositories/EventFilterRepository"
import type { ConfigService } from "@port/config/ConfigService"
import { EventFilter } from "@domain/eventfilter/model/EventFilter"

@Singleton()
@Handler(GetEventFiltersQuery)
export class GetEventFiltersQueryHandler implements QueryHandler<GetEventFiltersQuery, GetEventFiltersQueryResponse[]> {
  constructor(
    @Inject() private readonly eventFilterRepository: EventFilterRepository,
    @Inject() private readonly configService: ConfigService,
  ) {}

  @Validate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetEventFiltersQuery): Promise<GetEventFiltersQueryResponse[]> {
    const events = this.configService.getEvents()
    const eventFilters: GetEventFiltersQueryResponse[] = (await this.eventFilterRepository.findAll()).map(
      (eventFilter) => eventFilter as GetEventFiltersQueryResponse,
    )
    this.configService.getContracts().forEach((contract, index) => {
      const event = events[index]
      eventFilters.push({
        contractAddress: contract,
        eventName: EventFilter.extractEventNameFromSignature(event),
        eventSignature: event,
      } as GetEventFiltersQueryResponse)
    })

    return eventFilters
  }
}
