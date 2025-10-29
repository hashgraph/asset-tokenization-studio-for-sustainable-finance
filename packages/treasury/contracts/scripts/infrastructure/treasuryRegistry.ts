// SPDX-License-Identifier: Apache-2.0

/**
 * Treasury Registry Provider
 *
 * Dependency injection implementation providing Treasury facet definitions:
 * - 2 ATS facets (AccessControlFacet, PauseFacet)
 * - 3 GBP custom facet (LifeCycleCashFlowFacet, PortfolioFacet, ProceedsManagementFacet)
 *
 * @module infrastructure/treasuryRegistry
 */

import type {
    RegistryProvider,
    FacetDefinition,
} from '@hashgraph/asset-tokenization-contracts/scripts'
import { FACET_REGISTRY as ATS_REGISTRY } from '@hashgraph/asset-tokenization-contracts/scripts'
import {
    LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY,
    PORTFOLIO_RESOLVER_KEY,
    PROCEEDS_MANAGEMENT_RESOLVER_KEY,
} from '../domain/constants'

/**
 * Treasury facet definitions.
 *
 * Includes:
 * - ATS facets: AccessControlFacet, PauseFacet
 * - GBP custom facets: LifeCycleCashFlowFacet, PortfolioFacet, ProceedsManagementFacet
 */
const TREASURY_FACETS: Record<string, FacetDefinition> = {
    // ATS facets (subset)
    AccessControlFacet: ATS_REGISTRY.AccessControlFacet,
    PauseFacet: ATS_REGISTRY.PauseFacet,

    // GBP custom facets
    LifeCycleCashFlowFacet: {
        name: 'LifeCycleCashFlowFacet',
        description: "Bond's coupons and cash out payments",
        resolverKey: {
            name: 'LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY',
            value: LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY,
        },
    },
    PortfolioFacet: {
        name: 'PortfolioFacet',
        description: 'Manages the payment token and environmental assets',
        resolverKey: {
            name: 'PORTFOLIO_RESOLVER_KEY',
            value: PORTFOLIO_RESOLVER_KEY,
        },
    },
    ProceedsManagementFacet: {
        name: 'ProceedsManagementFacet',
        description: 'Transfers payment tokens and environmental assets tokens',
        resolverKey: {
            name: 'PROCEEDS_MANAGEMENT_RESOLVER_KEY',
            value: PROCEEDS_MANAGEMENT_RESOLVER_KEY,
        },
    },
}

/**
 * Treasury Registry Provider.
 *
 * Implements RegistryProvider interface for clean dependency injection.
 * Use with ATS operations that accept optional registry parameter.
 *
 * @example
 * ```typescript
 * import { deployFacets } from '@hashgraph/asset-tokenization-contracts/scripts';
 * import { treasuryRegistry } from './infrastructure/treasuryRegistry';
 *
 * // Deploy with Treasury registry
 * const result = await deployFacets(provider, {
 *   facetNames: ['AccessControlFacet', 'PauseFacet', 'LifeCycleCashFlowFacet', 'PortfolioFacet', 'ProceedsManagementFacet'],
 *   registry: treasuryRegistry  // ← Clean dependency injection!
 * });
 * ```
 */
export const treasuryRegistry: RegistryProvider = {
    getFacetDefinition(name: string): FacetDefinition | undefined {
        return TREASURY_FACETS[name]
    },

    getAllFacets(): FacetDefinition[] {
        return Object.values(TREASURY_FACETS)
    },
}
