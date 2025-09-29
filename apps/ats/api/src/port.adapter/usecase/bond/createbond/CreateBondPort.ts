// SPDX-License-Identifier: Apache-2.0
import { CreateBondRequest } from './model/CreateBondRequest'
import { CreateBondResponse } from './model/CreateBondResponse'

export interface CreateBondPort {
  createBond(bond: CreateBondRequest): Promise<CreateBondResponse>
}
