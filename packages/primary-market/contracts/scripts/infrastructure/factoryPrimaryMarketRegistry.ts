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
 * - GBP custom facets: FactoryPrimaryMarketFacet, PrimaryMarketFacet
 */
const FACTORY_PRIMARY_MARKET_FACETS: Record<string, FacetDefinition> = {
  // ATS facets (subset)
  AccessControlFacet: ATS_REGISTRY.AccessControlFacet,
  PauseFacet: ATS_REGISTRY.PauseFacet,
  TimeTravelFacet: ATS_REGISTRY.TimeTravelFacet,

  // GBP custom facets
  FactoryPrimaryMarketFacet: {
    name: "FactoryPrimaryMarketFacet",
    description: "Atomic deployment Primary Markets",
    resolverKey: {
      name: "FACTORY_PRIMARY_MARKET_RESOLVER_KEY",
      value: "0x98c9d1e17a94f8342c5219f2e037b33ad4a5f9cd3c6dada43d647da671418de5",
    },
  },

  PrimaryMarketFacet: {
    name: "PrimaryMarketFacet",
    description: "Primary Market operations (offerings, subscriptions)",
    resolverKey: {
      name: "PRIMARY_MARKET_RESOLVER_KEY",
      value: "0x7c5c1d6e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
    },
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
