// SPDX-License-Identifier: Apache-2.0

/**
 * FactoryPrimaryMarket Registry Provider
 *
 * Dependency injection implementation providing FactoryPrimaryMarket facet definitions:
 * - 2 ATS facets (AccessControlFacet, PauseFacet)
 * - 1 GBP custom facet (FactoryPrimaryMarketFacet)
 *
 * @module infrastructure/factoryPrimaryMarketRegistry
 */

import type { RegistryProvider, FacetDefinition } from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACET_REGISTRY as ATS_REGISTRY } from "@hashgraph/asset-tokenization-contracts/scripts";

/**
 * FactoryPrimaryMarket facet definitions.
 *
 * Includes:
 * - ATS facets: AccessControlFacet, PauseFacet
 * - GBP custom facets: FactoryPrimaryMarketFacet
 */
const FACTORY_PRIMARY_MARKET_FACETS: Record<string, FacetDefinition> = {
  // ATS facets (subset)
  AccessControlFacet: ATS_REGISTRY.AccessControlFacet,
  PauseFacet: ATS_REGISTRY.PauseFacet,

  // GBP custom facets
  FactoryPrimaryMarketFacet: {
    name: "FactoryPrimaryMarketFacet",
    description: "Atomic deployment Primary Markets",
  },
};

/**
 * FactoryPrimaryMarket Registry Provider.
 *
 * Implements RegistryProvider interface for clean dependency injection.
 * Use with ATS operations that accept optional registry parameter.
 *
 * @example
 * ```typescript
 * import { deployFacets } from '@hashgraph/asset-tokenization-contracts/scripts';
 * import { factoryPrimaryMarketRegistry } from './infrastructure/factoryPrimaryMarketRegistry';
 *
 * // Deploy with FactoryPrimaryMarket registry
 * const result = await deployFacets(provider, {
 *   facetNames: ['AccessControlFacet', 'PauseFacet', 'FactoryPrimaryMarketFacet'],
 *   registry: factoryPrimaryMarketRegistry  // ← Clean dependency injection!
 * });
 * ```
 */
export const factoryPrimaryMarketRegistry: RegistryProvider = {
  getFacetDefinition(name: string): FacetDefinition | undefined {
    return FACTORY_PRIMARY_MARKET_FACETS[name];
  },

  getAllFacets(): FacetDefinition[] {
    return Object.values(FACTORY_PRIMARY_MARKET_FACETS);
  },
};
