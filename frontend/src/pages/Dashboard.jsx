import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';

const MOCK_CHART = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}:00`,
  generated: +(Math.random() * 4 + 1).toFixed(2),
  consumed: +(Math.random() * 3 + 0.5).toFixed(2),
}));

export default function Dashboard() {
  const { publicKey, token, connect } = useAuth();
  const [meter, setMeter] = useState(null);

  useEffect(() => {
    if (!publicKey || !token) return;
    api(token).get(`/meter/${publicKey}`).then(d => setMeter(d.latest)).catch(() => {});
  }, [publicKey, token]);

  const surplus = meter ? (meter.kwhGenerated - meter.kwhConsumed).toFixed(2) : null;

  return (
    <div className="stack" style={{ paddingTop: '1rem' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.4rem' }}>⚡ EcoVolt</h1>
        {publicKey
          ? <span className="tag tag-green">{publicKey.slice(0, 6)}…{publicKey.slice(-4)}</span>
          : <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
        }
      </div>

      <div className="grid-2">
        <div className="card stat">
          <div className="value">{meter?.kwhGenerated?.toFixed(1) ?? '—'}</div>
          <div className="label">kWh Generated</div>
        </div>
        <div className="card stat">
          <div className="value">{meter?.kwhConsumed?.toFixed(1) ?? '—'}</div>
          <div className="label">kWh Consumed</div>
        </div>
        <div className="card stat">
          <div className="value" style={{ color: surplus > 0 ? 'var(--green)' : '#f87171' }}>
            {surplus ?? '—'}
          </div>
          <div className="label">Surplus kWh</div>
        </div>
        <div className="card stat">
          <div className="value">XLM</div>
          <div className="label">Currency</div>
        </div>
      </div>

      <div className="card">
        <p style={{ marginBottom: '.75rem', fontWeight: 600 }}>Today's Production</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MOCK_CHART}>
            <defs>
              <linearGradient id="gen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
            <Area type="monotone" dataKey="generated" stroke="#22c55e" fill="url(#gen)" name="Generated" />
            <Area type="monotone" dataKey="consumed" stroke="#60a5fa" fill="none" name="Consumed" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!publicKey && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Connect your Freighter wallet to see live meter data.
        </div>
      )}
    </div>
  );
}
