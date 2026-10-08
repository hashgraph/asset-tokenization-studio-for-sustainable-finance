// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface ResolverProxyConfiguration {
  key: string
  version: string
}

export interface Rbac {
  role: string
  members: string[]
}

export class PrimaryMarketDeployedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly primaryMarketAddress: string
  readonly resolver: string
  readonly resolverProxyConfiguration: ResolverProxyConfiguration
  readonly rbacs: Rbac[]

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    primaryMarketAddress: string,
    resolver: string,
    resolverProxyConfiguration: ResolverProxyConfiguration,
    rbacs: Rbac[],
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.primaryMarketAddress = primaryMarketAddress
    this.resolver = resolver
    this.resolverProxyConfiguration = resolverProxyConfiguration
    this.rbacs = rbacs
  }
}
