/**
 * POST /api/meter/reading  → ingest smart meter reading (IoT push)
 * GET  /api/meter/:publicKey → latest reading for a wallet
 *
 * In production: authenticate with a device certificate / HMAC.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const readings = new Map(); // publicKey → [readings]

// IoT devices POST here (add device auth in production)
router.post('/reading', (req, res) => {
  const { publicKey, kwhGenerated, kwhConsumed, timestamp } = req.body;
  if (!publicKey || kwhGenerated == null) return res.status(400).json({ error: 'publicKey and kwhGenerated required' });

  const reading = { kwhGenerated, kwhConsumed: kwhConsumed || 0, timestamp: timestamp || new Date(), surplus: kwhGenerated - (kwhConsumed || 0) };
  const list = readings.get(publicKey) || [];
  list.push(reading);
  if (list.length > 1000) list.shift(); // cap history
  readings.set(publicKey, list);

  res.json({ success: true, surplus: reading.surplus });
});

router.get('/:publicKey', authenticate, (req, res) => {
  const { publicKey } = req.params;
  if (publicKey !== req.user.publicKey) return res.status(403).json({ error: 'Forbidden' });
  const list = readings.get(publicKey) || [];
  res.json({ readings: list.slice(-48), latest: list.at(-1) || null });
});

export default router;
