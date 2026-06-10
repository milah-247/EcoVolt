import { createContext, useContext, useState, useCallback } from 'react';
import { getPublicKey, isConnected, signTransaction } from '@stellar/freighter-api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [publicKey, setPublicKey] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ev_token'));

  const connect = useCallback(async () => {
    const connected = await isConnected();
    if (!connected) throw new Error('Install Freighter wallet');
    const pk = await getPublicKey();

    // Challenge / sign / verify flow
    const { challenge } = await fetch('/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: pk }),
    }).then(r => r.json());

    // Freighter signs the raw challenge bytes encoded as a transaction envelope
    // For demo: sign a minimal XDR, then use the signature directly
    const sig = await signTransaction(challenge, { networkPassphrase: 'Test SDF Network ; September 2015' }).catch(() => challenge);

    const { token: jwt } = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: pk, signature: btoa(sig) }),
    }).then(r => r.json());

    localStorage.setItem('ev_token', jwt);
    setPublicKey(pk);
    setToken(jwt);
    return pk;
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('ev_token');
    setPublicKey(null);
    setToken(null);
  }, []);

  return <AuthCtx.Provider value={{ publicKey, token, connect, disconnect }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
