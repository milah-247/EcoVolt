/**
 * GET  /api/listings          → all active listings
 * POST /api/listings          → create listing (auth required)
 * GET  /api/listings/:id      → single listing
 * DELETE /api/listings/:id    → cancel listing (auth required, seller only)
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// In-memory store — replace with DB in production
const listings = new Map();
let nextId = 1;

router.get('/', (_req, res) => {
  res.json([...listings.values()].filter(l => l.active));
});

router.post('/', authenticate, (req, res) => {
  const { kwhAmount, pricePerKwh, txHash } = req.body;
  if (!kwhAmount || !pricePerKwh) return res.status(400).json({ error: 'kwhAmount and pricePerKwh required' });
  const id = nextId++;
  const listing = {
    id, seller: req.user.publicKey, kwhAmount: Number(kwhAmount),
    pricePerKwh: Number(pricePerKwh), txHash, active: true, createdAt: new Date(),
  };
  listings.set(id, listing);
  res.status(201).json(listing);
});

router.get('/:id', (req, res) => {
  const listing = listings.get(Number(req.params.id));
  if (!listing) return res.status(404).json({ error: 'Not found' });
  res.json(listing);
});

router.delete('/:id', authenticate, (req, res) => {
  const listing = listings.get(Number(req.params.id));
  if (!listing) return res.status(404).json({ error: 'Not found' });
  if (listing.seller !== req.user.publicKey) return res.status(403).json({ error: 'Forbidden' });
  listing.active = false;
  res.json({ success: true });
});

export default router;
