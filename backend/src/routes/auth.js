/**
 * Wallet-based auth: client signs a server-issued challenge with their Stellar keypair.
 * POST /api/auth/challenge  → { challenge }
 * POST /api/auth/verify     → { token }  (JWT)
 */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Keypair } from '@stellar/stellar-sdk';
import crypto from 'node:crypto';

const router = Router();
const challenges = new Map(); // publicKey → { challenge, exp }

router.post('/challenge', (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey) return res.status(400).json({ error: 'publicKey required' });
  const challenge = crypto.randomBytes(32).toString('hex');
  challenges.set(publicKey, { challenge, exp: Date.now() + 60_000 });
  res.json({ challenge });
});

router.post('/verify', (req, res) => {
  const { publicKey, signature } = req.body;
  if (!publicKey || !signature) return res.status(400).json({ error: 'publicKey and signature required' });

  const record = challenges.get(publicKey);
  if (!record || Date.now() > record.exp) return res.status(401).json({ error: 'Challenge expired' });

  try {
    const kp = Keypair.fromPublicKey(publicKey);
    const valid = kp.verify(Buffer.from(record.challenge, 'hex'), Buffer.from(signature, 'base64'));
    if (!valid) return res.status(401).json({ error: 'Invalid signature' });
    challenges.delete(publicKey);
    const token = jwt.sign({ publicKey }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (e) {
    res.status(401).json({ error: 'Verification failed' });
  }
});

export default router;
