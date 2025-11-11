/**
 * Green Bonds Platform - Shared Infrastructure Orchestration
 *
 * This package provides high-level orchestration workflows for deploying the complete GBP infrastructure.
 *
 * **What It Deploys:**
 * - BusinessLogicResolver (BLR) with transparent upgradeable proxy
 * - ProxyAdmin for upgrade management
 * - BOND configuration with all required facets
 * - FactorySuite configuration (reusing shared facets)
 *
 * @packageDocumentation
 */

// Export main orchestration workflow and its types
export * from "./workflows/deployGbpInfrastructure";
