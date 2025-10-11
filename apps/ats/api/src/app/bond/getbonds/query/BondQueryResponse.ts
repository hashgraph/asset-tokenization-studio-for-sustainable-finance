// SPDX-License-Identifier: Apache-2.0

import { PageResponse } from "@hashgraph/green-bonds-shared-core"
import { Bond } from "@domain/bond/model/Bond"

export class BondQueryResponse extends PageResponse<Bond> {}
