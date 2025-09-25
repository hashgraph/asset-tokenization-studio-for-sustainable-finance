// SPDX-License-Identifier: Apache-2.0

import { EventFilter } from "@domain/eventfilter/model/EventFilter"
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { EventFilterRepository } from "@domain/eventfilter/repositories/EventFilterRepository"

@Singleton()
export class AddEventFiltersDomainService {
  constructor(@Inject() private readonly eventFilterRepository: EventFilterRepository) {}

  async execute(contractAddress: string, eventSignatures: string[]): Promise<void> {
    const eventFilters = eventSignatures.map((eventSignature) => {
      return {
        contractAddress,
        eventName: AddEventFiltersDomainService.extractEventNameFromSignature(eventSignature),
        eventSignature: eventSignature,
      } as EventFilter
    })
    await this.eventFilterRepository.saveAll(eventFilters)
  }

  private static extractEventNameFromSignature(eventSignature: string): string {
    return eventSignature.substring(0, eventSignature.indexOf("("))
  }
}
