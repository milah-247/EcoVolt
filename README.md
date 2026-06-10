# EcoVolt ⚡

Peer-to-peer solar energy trading platform on the Stellar blockchain. Prosumers tokenize surplus solar energy and trade it directly with neighbours — no utility middleman.

## Architecture

```
EcoVolt/
├── contracts/          # Soroban smart contracts (Rust)
│   ├── energy_token/   # EKW fungible token (SEP-41)
│   └── marketplace/    # P2P listing & atomic swap
├── backend/            # Node/Express REST API
│   └── src/
│       ├── routes/     # auth, listings, trades, meter
│       ├── middleware/ # JWT auth
│       └── services/   # Stellar Horizon SDK
├── frontend/           # Vite + React SPA (mobile-first)
│   └── src/
│       ├── pages/      # Dashboard, Marketplace, Wallet
│       ├── hooks/      # useAuth (Freighter)
│       └── utils/      # api helper
└── docs/               # API & contract reference
```

## Quick Start

### Prerequisites
- Node 20+, Rust + `soroban-cli`, [Freighter](https://freighter.app) browser extension

### 1. Contracts
```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
# Deploy to testnet
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/energy_token.wasm --network testnet
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/marketplace.wasm --network testnet
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in contract addresses + secrets
npm install
npm run dev            # http://localhost:3001
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Features

| Feature | Status |
|---|---|
| EKW energy token (SEP-41) | ✅ |
| P2P marketplace (list / buy / cancel) | ✅ |
| Soroban escrow | ✅ |
| Wallet auth (Freighter) | ✅ |
| Smart meter API | ✅ |
| Energy dashboard + charts | ✅ |
| Mobile-first UI | ✅ |

## Smart Contracts

### EnergyToken (`energy_token`)
- `initialize(admin, name, symbol)` — one-time setup
- `mint(to, amount)` — admin mints EKW tokens (1 token = 1 kWh)
- `burn(from, amount)` — burn settled/consumed tokens
- `admin()` / `metadata()` — read-only getters

### Marketplace (`marketplace`)
- `initialize(admin, token_contract)` — link to EKW token
- `list(seller, kwh_amount, price_per_kwh)` → `listing_id` — escrow tokens
- `buy(buyer, listing_id, xlm_token)` — atomic swap: XLM → seller, EKW → buyer
- `cancel(seller, listing_id)` — return escrowed tokens

## API

See [docs/api.md](docs/api.md) for full reference.

## Environment Variables (backend)

| Variable | Description |
|---|---|
| `PORT` | API port (default 3001) |
| `JWT_SECRET` | Secret for signing JWTs |
| `STELLAR_NETWORK` | `testnet` or `mainnet` |
| `HORIZON_URL` | Stellar Horizon endpoint |
| `ENERGY_TOKEN_CONTRACT` | Deployed EKW contract ID |
| `MARKETPLACE_CONTRACT` | Deployed Marketplace contract ID |
| `ADMIN_SECRET` | Stellar secret key for minting |

## License
MIT
