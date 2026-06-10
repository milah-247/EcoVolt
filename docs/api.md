# EcoVolt API Reference

Base URL: `http://localhost:3001/api`

All authenticated endpoints require `Authorization: Bearer <jwt>`.

---

## Auth

### `POST /auth/challenge`
Request a sign challenge for a wallet.

**Body:** `{ "publicKey": "G..." }`  
**Response:** `{ "challenge": "<hex string>" }`

---

### `POST /auth/verify`
Submit a signed challenge to receive a JWT.

**Body:** `{ "publicKey": "G...", "signature": "<base64>" }`  
**Response:** `{ "token": "<jwt>" }`

---

## Listings

### `GET /listings`
All active energy listings.

**Response:** `Listing[]`

```json
[
  {
    "id": 1,
    "seller": "GXYZ...",
    "kwhAmount": 10.5,
    "pricePerKwh": 0.05,
    "active": true,
    "createdAt": "2026-06-10T06:00:00Z"
  }
]
```

---

### `POST /listings` 🔒
Create a new energy listing.

**Body:** `{ "kwhAmount": 10.5, "pricePerKwh": 0.05, "txHash": "optional" }`  
**Response:** `Listing`

---

### `GET /listings/:id`
Single listing by ID.

---

### `DELETE /listings/:id` 🔒
Cancel a listing (seller only). Sets `active: false`.

---

## Trades

### `GET /trades` 🔒
Returns local trade records + on-chain Horizon payment history for the authenticated wallet.

**Response:** `{ "local": Trade[], "onChain": HorizonOp[] }`

---

### `POST /trades` 🔒
Record a completed on-chain trade.

**Body:** `{ "listingId": 1, "txHash": "abc...", "kwhAmount": 10.5, "totalCost": 0.525 }`  
**Response:** `Trade`

---

## Smart Meter

### `POST /meter/reading`
Ingest a smart meter reading (IoT push endpoint).

**Body:**
```json
{
  "publicKey": "G...",
  "kwhGenerated": 5.2,
  "kwhConsumed": 3.1,
  "timestamp": "2026-06-10T06:00:00Z"
}
```
**Response:** `{ "success": true, "surplus": 2.1 }`

---

### `GET /meter/:publicKey` 🔒
Last 48 meter readings for the wallet. Auth must match `publicKey`.

**Response:**
```json
{
  "latest": { "kwhGenerated": 5.2, "kwhConsumed": 3.1, "surplus": 2.1, "timestamp": "..." },
  "readings": [...]
}
```
