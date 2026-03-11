// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { join } from "path";
import { tmpdir } from "os";
import { promises as fs, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { CheckpointManager, getTestDeploymentsDir } from "@hashgraph/asset-tokenization-contracts/scripts";
import {
  createCheckpointWithState,
  createCompletedTestCheckpoint,
  simulateFailureAtStep,
  assertCheckpointAtStep,
  createCheckpointCleanupHooks,
} from "@hashgraph/asset-tokenization-contracts/test";

const TEST_NETWORK = "hardhat";
const testDeployDir = getTestDeploymentsDir();

/** Ensure unique checkpoint IDs (timestamp-based) by waiting 1ms between creations. */
const ensureUniqueTimestamp = () => new Promise((resolve) => setTimeout(resolve, 2));

describe("Checkpoint Resume Integration Tests", () => {
  const { trackDir, afterEachCleanup } = createCheckpointCleanupHooks();

  before(async () => {
    await fs.rm(testDeployDir, { recursive: true, force: true });
  });

  afterEach(afterEachCleanup);

  after(async () => {
    await fs.rm(testDeployDir, { recursive: true, force: true });
  });

  function createIsolatedManager(): { manager: CheckpointManager; dir: string } {
    const dir = mkdtempSync(join(tmpdir(), "gbp-checkpoint-test-"));
    trackDir(dir);
    return { manager: new CheckpointManager(TEST_NETWORK, dir), dir };
  }

  describe("CheckpointManager CRUD Operations", () => {
    it("should create a checkpoint with correct initial state", () => {
      const { manager } = createIsolatedManager();

      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORK,
        deployer: "0x0000000000000000000000000000000000000001",
        workflowType: "newBlr",
        options: { useTimeTravel: false },
      });

      expect(checkpoint).to.have.property("checkpointId").that.is.a("string");
      expect(checkpoint.network).to.equal(TEST_NETWORK);
      expect(checkpoint.status).to.equal("in-progress");
      expect(checkpoint.currentStep).to.equal(-1);
      expect(checkpoint.workflowType).to.equal("newBlr");
    });

    it("should save and load a checkpoint preserving all fields", async () => {
      const { manager } = createIsolatedManager();

      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORK,
        deployer: "0x0000000000000000000000000000000000000001",
        workflowType: "newBlr",
        options: { useTimeTravel: false },
      });

      await manager.saveCheckpoint(checkpoint);

      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.not.be.null;
      expect(loaded!.checkpointId).to.equal(checkpoint.checkpointId);
      expect(loaded!.network).to.equal(checkpoint.network);
      expect(loaded!.status).to.equal(checkpoint.status);
      expect(loaded!.deployer).to.equal(checkpoint.deployer);
      expect(loaded!.workflowType).to.equal(checkpoint.workflowType);
    });

    it("should return null for non-existent checkpoint", async () => {
      const { manager } = createIsolatedManager();

      const loaded = await manager.loadCheckpoint("non-existent-checkpoint-id");
      expect(loaded).to.be.null;
    });

    it("should delete a checkpoint", async () => {
      const { manager } = createIsolatedManager();

      const checkpoint = manager.createCheckpoint({
        network: TEST_NETWORK,
        deployer: "0x0000000000000000000000000000000000000001",
        workflowType: "newBlr",
        options: {},
      });

      await manager.saveCheckpoint(checkpoint);
      await manager.deleteCheckpoint(checkpoint.checkpointId);

      const loaded = await manager.loadCheckpoint(checkpoint.checkpointId);
      expect(loaded).to.be.null;
    });
  });

  describe("findCheckpoints", () => {
    it("should find in-progress checkpoints for the network", async () => {
      const { manager } = createIsolatedManager();

      const checkpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
        currentStep: 2,
      });

      await manager.saveCheckpoint(checkpoint);

      const found = await manager.findCheckpoints(TEST_NETWORK, "in-progress");
      expect(found).to.have.lengthOf(1);
      expect(found[0].checkpointId).to.equal(checkpoint.checkpointId);
      expect(found[0].status).to.equal("in-progress");
    });

    it("should not return completed checkpoints when filtering for in-progress", async () => {
      const { manager } = createIsolatedManager();

      const completed = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "completed",
      });
      await manager.saveCheckpoint(completed);

      await ensureUniqueTimestamp();

      const inProgress = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
      });
      await manager.saveCheckpoint(inProgress);

      const found = await manager.findCheckpoints(TEST_NETWORK, "in-progress");
      expect(found).to.have.lengthOf(1);
      expect(found[0].checkpointId).to.equal(inProgress.checkpointId);
    });

    it("should return all checkpoints when no status filter is applied", async () => {
      const { manager } = createIsolatedManager();

      const cp1 = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "completed",
      });
      await manager.saveCheckpoint(cp1);

      await ensureUniqueTimestamp();

      const cp2 = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
      });
      await manager.saveCheckpoint(cp2);

      const found = await manager.findCheckpoints(TEST_NETWORK);
      expect(found).to.have.lengthOf(2);
    });
  });

  describe("Checkpoint Persistence Across Instances", () => {
    it("should load checkpoints created by a different manager instance", async () => {
      const dir = mkdtempSync(join(tmpdir(), "gbp-checkpoint-persist-"));
      trackDir(dir);

      // Manager 1 creates and saves
      const manager1 = new CheckpointManager(TEST_NETWORK, dir);
      const checkpoint = manager1.createCheckpoint({
        network: TEST_NETWORK,
        deployer: "0x0000000000000000000000000000000000000001",
        workflowType: "newBlr",
        options: {},
      });
      await manager1.saveCheckpoint(checkpoint);

      // Manager 2 loads from same directory
      const manager2 = new CheckpointManager(TEST_NETWORK, dir);
      const loaded = await manager2.loadCheckpoint(checkpoint.checkpointId);

      expect(loaded).to.not.be.null;
      expect(loaded!.checkpointId).to.equal(checkpoint.checkpointId);
      expect(loaded!.network).to.equal(TEST_NETWORK);
    });

    it("should find in-progress checkpoints from a different manager instance", async () => {
      const dir = mkdtempSync(join(tmpdir(), "gbp-checkpoint-find-"));
      trackDir(dir);

      const manager1 = new CheckpointManager(TEST_NETWORK, dir);
      const checkpoint = await createCheckpointWithState(manager1, {
        network: TEST_NETWORK,
        status: "in-progress",
        currentStep: 3,
      });
      await manager1.saveCheckpoint(checkpoint);

      const manager2 = new CheckpointManager(TEST_NETWORK, dir);
      const found = await manager2.findCheckpoints(TEST_NETWORK, "in-progress");

      expect(found).to.have.lengthOf(1);
      expect(found[0].currentStep).to.equal(3);
    });
  });

  describe("Failure Simulation and Resume", () => {
    it("should mark checkpoint as failed with failure details", async () => {
      const { manager } = createIsolatedManager();

      const checkpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
      });

      const failed = simulateFailureAtStep(checkpoint, 2, "Gas limit exceeded", "newBlr");

      expect(failed.status).to.equal("failed");
      expect(failed.failure).to.exist;
      expect(failed.failure!.step).to.equal(2);
      expect(failed.failure!.error).to.include("Gas limit exceeded");
    });

    it("should prepare failed checkpoint for resume", async () => {
      const { manager } = createIsolatedManager();

      const checkpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
      });

      const failed = simulateFailureAtStep(checkpoint, 2, "Network error", "newBlr");
      await manager.saveCheckpoint(failed);

      await manager.prepareForResume(failed);

      expect(failed.status).to.equal("in-progress");
      expect(failed.failure).to.be.undefined;
    });

    it("should find resumable checkpoints (in-progress and failed)", async () => {
      const { manager } = createIsolatedManager();

      const inProgress = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
        currentStep: 1,
      });
      await manager.saveCheckpoint(inProgress);

      await ensureUniqueTimestamp();

      const failed = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
        currentStep: 3,
      });
      const failedCheckpoint = simulateFailureAtStep(failed, 3, "Deployment error", "newBlr");
      await manager.saveCheckpoint(failedCheckpoint);

      const resumable = await manager.findResumableCheckpoints(TEST_NETWORK);
      expect(resumable).to.have.lengthOf(2);
    });
  });

  describe("Checkpoint Step Assertions", () => {
    it("should validate checkpoint at expected step", () => {
      const checkpoint = createCompletedTestCheckpoint();
      // Completed checkpoints have all steps - assertCheckpointAtStep validates structure
      assertCheckpointAtStep(checkpoint, checkpoint.currentStep);
    });

    it("should validate partial checkpoint with proxyAdmin deployed", async () => {
      const { manager } = createIsolatedManager();

      const checkpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        currentStep: 1,
        steps: {
          proxyAdmin: {
            address: "0x0000000000000000000000000000000000000001",
            txHash: "0x0000000000000000000000000000000000000000000000000000000000000001",
            deployedAt: new Date().toISOString(),
          },
        },
      });

      assertCheckpointAtStep(checkpoint, 1, {
        proxyAdminDeployed: true,
        blrDeployed: false,
      });
    });
  });

  describe("cleanupOldCheckpoints", () => {
    it("should remove completed checkpoints older than specified days", async () => {
      const { manager, dir } = createIsolatedManager();

      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      // Create a completed checkpoint, then backdate its lastUpdate on disk
      // (saveCheckpoint always overwrites lastUpdate with current time)
      const oldCheckpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "completed",
      });
      await manager.saveCheckpoint(oldCheckpoint);

      // Manually backdate the lastUpdate in the saved file
      const checkpointFile = join(dir, `${oldCheckpoint.checkpointId}.json`);
      const data = JSON.parse(readFileSync(checkpointFile, "utf-8"));
      data.lastUpdate = sixtyDaysAgo.toISOString();
      writeFileSync(checkpointFile, JSON.stringify(data, null, 2), "utf-8");

      await ensureUniqueTimestamp();

      // Create a recent completed checkpoint
      const recentCheckpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "completed",
      });
      await manager.saveCheckpoint(recentCheckpoint);

      const cleaned = await manager.cleanupOldCheckpoints(TEST_NETWORK, 30);

      expect(cleaned).to.equal(1);

      // Verify old checkpoint is gone
      const oldLoaded = await manager.loadCheckpoint(oldCheckpoint.checkpointId);
      expect(oldLoaded).to.be.null;

      // Verify recent checkpoint still exists
      const recentLoaded = await manager.loadCheckpoint(recentCheckpoint.checkpointId);
      expect(recentLoaded).to.not.be.null;
    });

    it("should not remove failed checkpoints regardless of age", async () => {
      const { manager } = createIsolatedManager();

      const failedCheckpoint = await createCheckpointWithState(manager, {
        network: TEST_NETWORK,
        status: "in-progress",
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      });
      const failed = simulateFailureAtStep(failedCheckpoint, 1, "Old failure", "newBlr");
      await manager.saveCheckpoint(failed);

      const cleaned = await manager.cleanupOldCheckpoints(TEST_NETWORK, 30);

      expect(cleaned).to.equal(0);

      const loaded = await manager.loadCheckpoint(failed.checkpointId);
      expect(loaded).to.not.be.null;
    });

    it("should return 0 when no checkpoints need cleanup", async () => {
      const { manager } = createIsolatedManager();

      const cleaned = await manager.cleanupOldCheckpoints(TEST_NETWORK, 30);
      expect(cleaned).to.equal(0);
    });
  });
});
