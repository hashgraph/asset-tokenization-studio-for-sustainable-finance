const { Client } = require('pg');
const { log, logSuccess, logError, logHeader, logInfo, colors } = require('../../shared/lib/logger');

async function checkDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'evercity_ats',
  });

  try {
    await client.connect();
    logSuccess('Connected to database');

    const bondContractId = process.env.BOND_CONTRACT_ID;
    const holderAccountId = process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;

    if (!bondContractId) {
      logError('BOND_CONTRACT_ID is required');
      process.exit(1);
    }

    // Check bond locks
    logHeader('\n📊 Bond Locks');
    const locksQuery = `
      SELECT id, contract_id, holder_account_id, partition, amount, expiration_timestamp, operator_account_id, created_at
      FROM bond_locks
      WHERE contract_id = $1
      ${holderAccountId ? 'AND holder_account_id = $2' : ''}
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const locksParams = holderAccountId ? [bondContractId, holderAccountId] : [bondContractId];
    const locksResult = await client.query(locksQuery, locksParams);

    if (locksResult.rows.length === 0) {
      logError('No locks found');
    } else {
      logSuccess(`Found ${locksResult.rows.length} lock(s):`);
      locksResult.rows.forEach((row, index) => {
        log(`\n${index + 1}. Lock ID: ${row.id}`, colors.cyan);
        logInfo(`   Holder: ${row.holder_account_id}`);
        logInfo(`   Partition: ${row.partition}`);
        logInfo(`   Amount: ${row.amount}`);
        logInfo(`   Expiration: ${row.expiration_timestamp}`);
        logInfo(`   Operator: ${row.operator_account_id}`);
        logInfo(`   Created: ${row.created_at}`);
      });
    }

    // Check holder balances
    logHeader('\n💰 Bond Holder Balances');
    const balancesQuery = `
      SELECT contract_id, holder_account_id, partition, available_balance, locked_balance, clearing_balance, held_balance, updated_at
      FROM bond_holder_balances
      WHERE contract_id = $1
      ${holderAccountId ? 'AND holder_account_id = $2' : ''}
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    const balancesParams = holderAccountId ? [bondContractId, holderAccountId] : [bondContractId];
    const balancesResult = await client.query(balancesQuery, balancesParams);

    if (balancesResult.rows.length === 0) {
      logError('No holder balances found');
    } else {
      logSuccess(`Found ${balancesResult.rows.length} balance(s):`);
      balancesResult.rows.forEach((row, index) => {
        log(`\n${index + 1}. Holder: ${row.holder_account_id}`, colors.cyan);
        logInfo(`   Partition: ${row.partition}`);
        logInfo(`   Available: ${row.available_balance}`);
        logInfo(`   Locked: ${row.locked_balance}`);
        logInfo(`   Clearing: ${row.clearing_balance}`);
        logInfo(`   Held: ${row.held_balance}`);
        logInfo(`   Updated: ${row.updated_at}`);
      });
    }

    // Check DLT events
    logHeader('\n📡 Recent DLT Events');
    const eventsQuery = `
      SELECT id, event_name, status, error_reason, created_at
      FROM dlt_events
      WHERE contract_address = (
        SELECT LOWER(CONCAT('0x', LPAD(TO_HEX(CAST(SPLIT_PART($1, '.', 3) AS BIGINT)), 40, '0')))
      )
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const eventsResult = await client.query(eventsQuery, [bondContractId]);

    if (eventsResult.rows.length === 0) {
      logError('No DLT events found');
    } else {
      logSuccess(`Found ${eventsResult.rows.length} event(s):`);
      eventsResult.rows.forEach((row, index) => {
        const statusColor = row.status === 'PROCESSED' ? colors.green : row.status === 'FAILED' ? colors.red : colors.yellow;
        log(`\n${index + 1}. ${row.event_name} - ${row.status}`, statusColor);
        logInfo(`   Created: ${row.created_at}`);
        if (row.error_reason) {
          logError(`   Error: ${row.error_reason}`);
        }
      });
    }

  } catch (error) {
    logError(`Database error: ${error.message}`);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    logHeader('🔍 Evercity Database Check');
    log('==========================================\n', colors.bright);

    await checkDatabase();

    logHeader('\n✅ Database Check Completed!');
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError('\nTroubleshooting:');
    logError('   • Ensure PostgreSQL is running');
    logError('   • Check database credentials in .env');
    logError('   • Verify BOND_CONTRACT_ID is correct');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkDatabase };
