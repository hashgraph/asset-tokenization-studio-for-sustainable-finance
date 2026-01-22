/**
 * GBP Shared Infrastructure - Deployment and upgrade orchestration.
 *
 * @packageDocumentation
 */

// Export infrastructure configuration (workflow registration)
export * from "./infrastructure";

// Export main orchestration workflows
export * from "./workflows";

// Export GBP-specific types
export type { GbpWorkflowType, GbpInfrastructureOutput, GbpUpgradeOutput } from "@scripts/types/workflows";
