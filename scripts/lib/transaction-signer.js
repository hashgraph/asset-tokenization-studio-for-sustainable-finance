const { Client, Transaction, PrivateKey } = require('@hashgraph/sdk');
const { ethers } = require('ethers');
const { config } = require('./config');
const { logError, logInfo } = require('./logger');

async function signHederaTransaction(transaction, privateKeyStr) {
  const privateKey = PrivateKey.fromStringDer(privateKeyStr);
  const client = Client.forTestnet();
  const hexString = transaction.startsWith('0x') ? transaction.slice(2) : transaction;
  const transactionBytes = new Uint8Array(Buffer.from(hexString, 'hex'));
  const transactionFromBytes = Transaction.fromBytes(transactionBytes).freezeWith(client);
  const signedTransaction = await transactionFromBytes.sign(privateKey);
  const signedBytes = signedTransaction.toBytes();
  const signedHex = Buffer.from(signedBytes).toString('hex');
  return signedHex;
}

async function signEvmTransaction(transaction, privateKeyStr) {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://testnet.hashio.io/api"
  );
  const wallet = new ethers.Wallet(privateKeyStr, provider);
  
  const nonce = await provider.getTransactionCount(wallet.address, "pending");
  const txBack = ethers.utils.parseTransaction(transaction);

  const txToSign = {
    to: txBack.to,
    nonce: nonce,
    gasLimit: txBack.gasLimit,
    data: txBack.data,
    value: txBack.value,
    chainId: txBack.chainId,
    gasPrice: ethers.utils.parseUnits("600", "gwei"),
    type: 0,
  };
  const signedTx = await wallet.signTransaction(txToSign);
  return signedTx;
}

async function signTransaction(transaction) {
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  
  if (!['hedera', 'ethereum'].includes(format)) {
    throw new Error(`Invalid BLOCKCHAIN_FORMAT: ${config.BLOCKCHAIN_FORMAT}. Must be 'hedera' or 'ethereum'`);
  }
  
  const privateKey = format === 'hedera' ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;
  
  if (!privateKey) {
    const keyName = format === 'hedera' ? 'HEDERA_PRIVATE_KEY' : 'ETHEREUM_PRIVATE_KEY';
    throw new Error(`${keyName} not found in environment variables`);
  }
  
  logInfo(`Using ${format.toUpperCase()} blockchain format`);
  
  if (format === 'hedera') {
    return await signHederaTransaction(transaction, privateKey);
  } else {
    return await signEvmTransaction(transaction, privateKey);
  }
}

function validateSigningConfig() {
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  
  if (!['hedera', 'ethereum'].includes(format)) {
    logError(`Invalid BLOCKCHAIN_FORMAT: ${config.BLOCKCHAIN_FORMAT}. Must be 'hedera' or 'ethereum'`);
    return false;
  }
  
  const privateKey = format === 'hedera' ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;
  
  if (!privateKey) {
    const keyName = format === 'hedera' ? 'HEDERA_PRIVATE_KEY' : 'ETHEREUM_PRIVATE_KEY';
    logError(`${keyName} not found in environment variables`);
    logInfo('Please set the required private key in your .env file:');
    logInfo(`   ${keyName}=your-private-key`);
    return false;
  }
  
  return true;
}

module.exports = {
  signHederaTransaction,
  signEvmTransaction,
  signTransaction,
  validateSigningConfig
};