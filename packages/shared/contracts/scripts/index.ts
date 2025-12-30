/**
 * GBP Shared Infrastructure - Deployment and upgrade orchestration.
 *
 * @packageDocumentation
 */

// Export infrastructure configuration (workflow registration)
export * from "./infrastructure";

// Export main orchestration workflows and their types
export * from "./workflows/deployGbpInfrastructure";
export * from "./workflows/upgradeGbpConfigurations";

// Export GBP-specific types
export type { GbpWorkflowType, GbpInfrastructureOutput, GbpUpgradeOutput } from "@scripts/types/workflows";
