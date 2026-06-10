import { Horizon, Keypair, Networks, TransactionBuilder, BASE_FEE } from '@stellar/stellar-sdk';

export const horizon = new Horizon.Server(process.env.HORIZON_URL);
export const networkPassphrase =
  process.env.STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

/** Fetch XLM + EKW token balances for a public key. */
export async function getBalances(publicKey) {
  const account = await horizon.loadAccount(publicKey);
  return account.balances.map(({ asset_type, asset_code, asset_issuer, balance }) => ({
    asset: asset_type === 'native' ? 'XLM' : asset_code,
    issuer: asset_issuer || null,
    balance,
  }));
}

/** Return recent payment operations for an account. */
export async function getHistory(publicKey, limit = 20) {
  const ops = await horizon
    .operations()
    .forAccount(publicKey)
    .order('desc')
    .limit(limit)
    .call();
  return ops.records;
}
