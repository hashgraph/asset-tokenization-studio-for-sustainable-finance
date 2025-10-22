import {CreatedBondEvent} from "@domain/bond/events/CreatedBondEvent";

export interface CreateBondFiltersPort {
  handle(event: CreatedBondEvent): Promise<void>
}
