# Deployments Directory

This directory contains deployment artifacts and state management for the Green Bonds Platform shared contracts.

## Structure

```
deployments/
├── .checkpoints/          # Deployment checkpoint files (created automatically)
│   └── *.json            # Checkpoint files (gitignored)
└── README.md             # This file
```

**Note**: The `.checkpoints/` directory is created automatically by the deployment scripts when needed.

## Checkpoint System

### What are Checkpoints?

Checkpoints are deployment state snapshots that enable:
- **Resuming failed deployments** without redeploying already-deployed contracts
- **Gas cost savings** by skipping completed steps
- **Deployment auditing** with complete deployment history
- **Persistence across npm operations** (not stored in node_modules)

### Checkpoint Lifecycle

1. **Creation**: Checkpoint created at deployment start with unique ID `{network}-{timestamp}`
2. **Incremental Saving**: After each major step (ProxyAdmin, BLR, Facets, Configurations, Factory)
3. **Auto-Resume**: If deployment fails, next run auto-detects and resumes from checkpoint
4. **Completion**: Marked as "completed" or "failed" when deployment finishes

### Checkpoint Files

Checkpoint files are stored as JSON in `.checkpoints/`:
- Format: `{network}-{timestamp}.json`
- Example: `hedera-testnet-1762965051697.json`
- Status: `in-progress`, `completed`, or `failed`

**Note**: Checkpoint JSON files are gitignored (local deployment state only).

### Using Checkpoints

**Default Behavior (Auto-Resume Enabled)**:
```typescript
const result = await deployGbpInfrastructure(signer, {
  network: 'hedera-testnet',
  // Checkpoint directory defaults to ./deployments/.checkpoints
  // Auto-resumes incomplete deployments automatically
});
```

**Custom Checkpoint Directory**:
```typescript
const result = await deployGbpInfrastructure(signer, {
  network: 'hedera-testnet',
  checkpointDir: '/tmp/my-checkpoints', // Custom location
});
```

**Force Fresh Deployment (Ignore Checkpoints)**:
```typescript
// For fresh deployments, delete checkpoint files or use a different directory
// The checkpoint system will detect no incomplete deployments and start fresh
```

### Resuming Failed Deployments

When a deployment fails:

1. **Checkpoint is saved** with failure information:
   ```
   💾 Checkpoint saved with failure information: hedera-testnet-1762965051697
   ```

2. **Simply re-run** the same deployment command:
   ```bash
   npm run deploy:gbp:infrastructure
   ```

3. **Auto-resume happens**:
   - Script detects incomplete checkpoint
   - Reconnects to already-deployed contracts
   - Skips completed steps
   - Retries from failure point

### What Gets Saved in Checkpoints

- ✅ ProxyAdmin address and deployment details
- ✅ BLR (BusinessLogicResolver) address
- ✅ All deployed facets with addresses and transaction hashes
- ✅ Facet registration status
- ✅ Configuration creation results
- ✅ Factory deployment details
- ✅ Failure information (if deployment failed)
- ✅ Complete deployment options used

### Managing Checkpoints

**List checkpoints**:
```bash
ls -la packages/shared/contracts/deployments/.checkpoints/
```

**Delete specific checkpoint** (to force fresh deployment):
```bash
rm packages/shared/contracts/deployments/.checkpoints/hedera-testnet-1762965051697.json
```

**Delete all checkpoints**:
```bash
rm packages/shared/contracts/deployments/.checkpoints/*.json
```

**Cleanup old completed checkpoints**:
The checkpoint system includes automatic cleanup for old completed deployments (>30 days).

### Checkpoint vs node_modules

**Previously (Before checkpointDir Option)**:
- Checkpoints saved in `node_modules/@hashgraph/.../deployments/.checkpoints/`
- Lost on `npm install` or `npm ci`
- Separate checkpoints per package instance

**Now (With checkpointDir Option)**:
- Checkpoints saved in `packages/shared/contracts/deployments/.checkpoints/`
- Persist across `npm install` and `npm ci`
- Shared across deployment runs
- Can be version-controlled if needed (currently gitignored)

## Best Practices

1. **Never commit checkpoint JSON files** - They contain deployment state specific to your environment
2. **Use default checkpoint directory** - Unless you have specific requirements
3. **Review checkpoints before cleanup** - They contain valuable deployment history
4. **Monitor checkpoint accumulation** - Clean up old completed checkpoints periodically

## Troubleshooting

**"No checkpoints found" but I see checkpoint files**:
- Verify checkpoint directory path is correct
- Check checkpoint files are in the configured directory
- Ensure checkpoint network matches deployment network

**"Checkpoint resume failed"**:
- Check deployed contract addresses are still valid
- Verify network connectivity
- Review checkpoint JSON for corruption
- Delete checkpoint and restart if necessary

**"Gas limit exceeded" during resume**:
- This is a Hedera throttling limit, not a checkpoint issue
- Checkpoint will save progress before failure
- Resume will retry the failed step with same gas settings
- Consider adjusting gas limits in deployment configuration

## Related Documentation

- [Checkpoint System Architecture](../../node_modules/@hashgraph/asset-tokenization-contracts/scripts/infrastructure/checkpoint/)
- [Deployment Workflows](../../node_modules/@hashgraph/asset-tokenization-contracts/scripts/workflows/)
- [GBP Infrastructure Deployment](../scripts/workflows/deployGbpInfrastructure.ts)
