import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';

function ListingCard({ listing, onBuy, onCancel, publicKey }) {
  return (
    <div className="card stack" style={{ gap: '.5rem' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700 }}>{listing.kwhAmount} kWh</span>
        <span className="tag tag-green">Active</span>
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
        {listing.pricePerKwh} XLM / kWh &nbsp;·&nbsp; Total: {(listing.kwhAmount * listing.pricePerKwh).toFixed(2)} XLM
      </div>
      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
        Seller: {listing.seller.slice(0, 8)}…{listing.seller.slice(-4)}
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: '.25rem' }}>
        {listing.seller === publicKey
          ? <button className="btn btn-danger" style={{ fontSize: '.8rem' }} onClick={() => onCancel(listing.id)}>Cancel</button>
          : <button className="btn btn-primary" style={{ fontSize: '.8rem' }} onClick={() => onBuy(listing)}>Buy Energy</button>
        }
      </div>
    </div>
  );
}

function CreateForm({ onCreated, token }) {
  const [form, setForm] = useState({ kwhAmount: '', pricePerKwh: '' });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await api(token).post('/listings', form);
    setForm({ kwhAmount: '', pricePerKwh: '' });
    onCreated();
    setLoading(false);
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <p style={{ fontWeight: 600 }}>List Surplus Energy</p>
      <input type="number" placeholder="kWh amount" min="0.01" step="0.01" required
        value={form.kwhAmount} onChange={e => setForm(f => ({ ...f, kwhAmount: e.target.value }))} />
      <input type="number" placeholder="Price per kWh (XLM)" min="0.0001" step="0.0001" required
        value={form.pricePerKwh} onChange={e => setForm(f => ({ ...f, pricePerKwh: e.target.value }))} />
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Creating…' : '⚡ List Energy'}
      </button>
    </form>
  );
}

export default function Marketplace() {
  const { publicKey, token, connect } = useAuth();
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState('browse'); // 'browse' | 'sell'

  const load = () => api(token).get('/listings').then(setListings).catch(() => {});

  useEffect(() => { load(); }, [token]);

  async function handleBuy(listing) {
    if (!token) return connect();
    // In production: invoke Marketplace.buy via Soroban + Freighter
    alert(`Initiating on-chain purchase of ${listing.kwhAmount} kWh from ${listing.seller.slice(0,8)}…\n\nIntegrate with Soroban marketplace contract to complete.`);
  }

  async function handleCancel(id) {
    await api(token).del(`/listings/${id}`);
    load();
  }

  return (
    <div className="stack" style={{ paddingTop: '1rem' }}>
      <h2>🏪 Energy Market</h2>

      <div className="row" style={{ gap: '.5rem' }}>
        {['browse', 'sell'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }} onClick={() => setTab(t)}>
            {t === 'browse' ? '🔍 Browse' : '⚡ Sell Energy'}
          </button>
        ))}
      </div>

      {tab === 'sell' && (
        publicKey
          ? <CreateForm token={token} onCreated={load} />
          : <div className="card" style={{ textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={connect}>Connect Wallet to Sell</button>
            </div>
      )}

      {tab === 'browse' && (
        listings.length === 0
          ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No active listings.</div>
          : listings.map(l => (
              <ListingCard key={l.id} listing={l} publicKey={publicKey} onBuy={handleBuy} onCancel={handleCancel} />
            ))
      )}
    </div>
  );
}
