import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';

export default function Wallet() {
  const { publicKey, token, connect, disconnect } = useAuth();
  const [trades, setTrades] = useState({ local: [], onChain: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api(token).get('/trades').then(setTrades).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (!publicKey) {
    return (
      <div className="stack" style={{ paddingTop: '2rem', alignItems: 'center' }}>
        <div style={{ fontSize: '3rem' }}>👛</div>
        <p style={{ color: 'var(--text-muted)' }}>Connect your Stellar wallet to view balances and trade history.</p>
        <button className="btn btn-primary" onClick={connect}>Connect Freighter Wallet</button>
      </div>
    );
  }

  return (
    <div className="stack" style={{ paddingTop: '1rem' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>👛 Wallet</h2>
        <button className="btn btn-outline" style={{ fontSize: '.8rem' }} onClick={disconnect}>Disconnect</button>
      </div>

      <div className="card">
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Stellar Address</p>
        <code style={{ fontSize: '.75rem', wordBreak: 'break-all' }}>{publicKey}</code>
      </div>

      <div className="card stack">
        <p style={{ fontWeight: 600 }}>EKW Token Balance</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
          Query your balance via Stellar Horizon API or Freighter.
        </p>
        <a
          className="btn btn-outline"
          style={{ fontSize: '.8rem', display: 'inline-block', width: 'fit-content' }}
          href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Stellar Expert ↗
        </a>
      </div>

      <div className="card stack">
        <p style={{ fontWeight: 600 }}>Trade History</p>
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {trades.local.length === 0 && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>No trades yet.</p>
        )}
        {trades.local.map(t => (
          <div key={t.id} className="card" style={{ fontSize: '.85rem', gap: '.3rem' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="tag tag-green">Bought</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>{new Date(t.tradedAt).toLocaleDateString()}</span>
            </div>
            <div>{t.kwhAmount} kWh · {t.totalCost} XLM</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '.7rem' }}>
              tx: {t.txHash?.slice(0, 16)}…
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
