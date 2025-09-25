// SPDX-License-Identifier: Apache-2.0

import { EventFilterRepository } from "@domain/eventfilter/repositories/EventFilterRepository"
import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { EventFilterPersistence } from "../model/EventFilterPersistence"
import { InjectRepository } from "@nestjs/typeorm"
import { EventFilter } from "@domain/eventfilter/model/EventFilter"

@Singleton()
export class EventFilterTypeOrmRepository implements EventFilterRepository {
  constructor(
    @InjectRepository(EventFilterPersistence)
    private readonly eventFilterRepository: Repository<EventFilterPersistence>,
  ) {}

  async saveAll(eventFilters: EventFilter[]): Promise<void> {
    await this.eventFilterRepository.save(eventFilters.map((eventFilter) => eventFilter as EventFilterPersistence))
  }

  async findAll(): Promise<EventFilter[]> {
    return (
      await this.eventFilterRepository.find({
        order: {
          createAt: "ASC",
        },
      })
    ).map((persistence) => persistence as EventFilter)
  }
}
