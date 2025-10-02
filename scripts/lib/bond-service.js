const axios = require('axios');
const { config } = require('./config');
const { logSuccess, logError, logInfo, log, colors } = require('./logger');

async function createBond(format) {
  log(`\n📋 Creating ${format.toUpperCase()} bond...`, colors.bright);
  
  const bondData = {
    name: `Demo Green Bond (${format.toUpperCase()})`,
    description: `A demonstration green bond for ${format} blockchain`,
    symbol: `DGB-${format.toUpperCase()}-${Date.now()}`,
    format: format
  };
  
  try {
    const response = await axios.post(`${config.ATS_API_URL}/api/v1/ats/bonds`, bondData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    logSuccess(`${format.toUpperCase()} bond created successfully!`);
    logInfo(`Symbol: ${bondData.symbol}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);
    
    return { ...bondData, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createBond
};