/**
 * GET  /api/trades            → trade history for authenticated user
 * POST /api/trades            → record a completed on-chain trade
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getHistory } from '../services/stellar.js';

const router = Router();
const trades = [];

router.get('/', authenticate, async (req, res) => {
  const { publicKey } = req.user;
  // Merge local records with on-chain history
  const onChain = await getHistory(publicKey).catch(() => []);
  const local = trades.filter(t => t.buyer === publicKey || t.seller === publicKey);
  res.json({ local, onChain });
});

router.post('/', authenticate, (req, res) => {
  const { listingId, txHash, kwhAmount, totalCost } = req.body;
  if (!listingId || !txHash) return res.status(400).json({ error: 'listingId and txHash required' });
  const trade = {
    id: trades.length + 1,
    buyer: req.user.publicKey,
    listingId, txHash, kwhAmount, totalCost,
    tradedAt: new Date(),
  };
  trades.push(trade);
  res.status(201).json(trade);
});

export default router;
