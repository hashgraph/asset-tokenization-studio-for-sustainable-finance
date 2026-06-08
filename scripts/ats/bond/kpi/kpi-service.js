const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { log, logSuccess, logError, logInfo, colors } = require("../../../shared/lib/logger");

async function setInterestRateTx(bondContractId, interestRate, format) {
  log(`\n⚙️  Creating setInterestRate transaction for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.post(`/api/v1/ats/bonds/${bondContractId}/kpi/interest-rate-transactions`, {
      format,
      accountId: process.env.ACCOUNT_ID,
      interestRate,
    });
    logSuccess("setInterestRate transaction created!");
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 80)}...`);
    return response.data;
  } catch (error) {
    logError(`Failed to create setInterestRate tx: ${error.message}`);
    if (error.response?.data) logError(JSON.stringify(error.response.data, null, 2));
    throw error;
  }
}

async function setImpactDataTx(bondContractId, impactData, format) {
  log(`\n📊 Creating setImpactData transaction for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.post(`/api/v1/ats/bonds/${bondContractId}/kpi/impact-data-transactions`, {
      format,
      accountId: process.env.ACCOUNT_ID,
      impactData,
    });
    logSuccess("setImpactData transaction created!");
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 80)}...`);
    return response.data;
  } catch (error) {
    logError(`Failed to create setImpactData tx: ${error.message}`);
    if (error.response?.data) logError(JSON.stringify(error.response.data, null, 2));
    throw error;
  }
}

async function addKpiDataTx(bondContractId, date, value, projectAddress, format) {
  log(`\n📈 Creating addKpiData transaction for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.post(`/api/v1/ats/bonds/${bondContractId}/kpi/data-transactions`, {
      format,
      accountId: process.env.ACCOUNT_ID,
      date,
      value,
      projectAddress,
    });
    logSuccess("addKpiData transaction created!");
    logInfo(`Date: ${date}, Value: ${value}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 80)}...`);
    return response.data;
  } catch (error) {
    logError(`Failed to create addKpiData tx: ${error.message}`);
    if (error.response?.data) logError(JSON.stringify(error.response.data, null, 2));
    throw error;
  }
}

function logApiError(label, error) {
  const status = error.response?.status;
  const body = error.response?.data;
  logError(`${label} — HTTP ${status ?? "unknown"}: ${error.message}`);
  if (body) logError(`Response body: ${JSON.stringify(body, null, 2)}`);
  if (status === 500)
    logError("→ 500 usually means the DB table doesn't exist. Restart the ATS API so migrations run.");
  if (status === 404) logError("→ 404: data not persisted yet — listener may still be processing the event");
}

async function getInterestRate(bondContractId) {
  log(`\n🔍 Fetching interest rate for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/kpi/interest-rate`);
    logSuccess("Interest rate retrieved!");
    logInfo(`  maxRate: ${response.data.maxRate}`);
    logInfo(`  baseRate: ${response.data.baseRate}`);
    logInfo(`  minRate: ${response.data.minRate}`);
    logInfo(`  startPeriod: ${response.data.startPeriod}`);
    logInfo(`  rateDecimals: ${response.data.rateDecimals}`);
    logInfo(`  operator: ${response.data.operator}`);
    return response.data;
  } catch (error) {
    logApiError("Failed to fetch interest rate", error);
    throw error;
  }
}

async function getImpactData(bondContractId) {
  log(`\n🔍 Fetching impact data for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/kpi/impact-data`);
    logSuccess("Impact data retrieved!");
    logInfo(`  maxDeviationCap: ${response.data.maxDeviationCap}`);
    logInfo(`  baseLine: ${response.data.baseLine}`);
    logInfo(`  maxDeviationFloor: ${response.data.maxDeviationFloor}`);
    logInfo(`  impactDataDecimals: ${response.data.impactDataDecimals}`);
    logInfo(`  adjustmentPrecision: ${response.data.adjustmentPrecision}`);
    logInfo(`  operator: ${response.data.operator}`);
    return response.data;
  } catch (error) {
    logApiError("Failed to fetch impact data", error);
    throw error;
  }
}

async function getKpiData(bondContractId, options = {}) {
  const { page = 1, limit = 10 } = options;
  log(`\n🔍 Fetching KPI data points for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/kpi/data`, {
      params: { page, limit },
    });
    logSuccess(`KPI data retrieved — total: ${response.data.total}`);
    response.data.items.forEach((item, i) => {
      logInfo(`  [${i + 1}] date=${item.date}, value=${item.value}, id=${item.id}`);
    });
    return response.data;
  } catch (error) {
    logApiError("Failed to fetch KPI data", error);
    throw error;
  }
}

async function getKpiDataItem(bondContractId, kpiDataId) {
  log(`\n🔍 Fetching KPI data item ${kpiDataId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/kpi/data/${kpiDataId}`);
    logSuccess("KPI data item retrieved!");
    logInfo(`  id: ${response.data.id}`);
    logInfo(`  date: ${response.data.date}`);
    logInfo(`  value: ${response.data.value}`);
    logInfo(`  project: ${response.data.project}`);
    return response.data;
  } catch (error) {
    logApiError("Failed to fetch KPI data item", error);
    throw error;
  }
}

module.exports = {
  setInterestRateTx,
  setImpactDataTx,
  addKpiDataTx,
  getInterestRate,
  getImpactData,
  getKpiData,
  getKpiDataItem,
};
