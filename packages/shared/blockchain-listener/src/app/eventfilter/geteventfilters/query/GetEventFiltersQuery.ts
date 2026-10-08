// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { GetEventFiltersQueryResponse } from "@app/eventfilter/geteventfilters/query/GetEventFiltersQueryResponse"

export class GetEventFiltersQuery extends Query<GetEventFiltersQueryResponse[]> {}
