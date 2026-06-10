# EcoVolt Smart Contracts

## EnergyToken

**File:** `contracts/energy_token/src/lib.rs`  
**Symbol:** EKW — 1 token = 1 kWh of solar energy  
**Standard:** SEP-41 (Soroban fungible token interface)

### Storage

| Key | Type | Description |
|-----|------|-------------|
| `Admin` | `Address` | Contract admin |
| `Metadata` | `TokenMetadata` | name, symbol, decimals |

### Functions

| Function | Auth | Description |
|----------|------|-------------|
| `initialize(admin, name, symbol)` | — | One-time setup |
| `mint(to, amount)` | Admin | Mint EKW (1 token = 1 kWh) |
| `burn(from, amount)` | `from` | Burn consumed/settled tokens |
| `admin()` | — | Read admin address |
| `metadata()` | — | Read name/symbol/decimals |

---

## Marketplace

**File:** `contracts/marketplace/src/lib.rs`

### Storage

| Key | Type | Description |
|-----|------|-------------|
| `Admin` | `Address` | Contract admin |
| `TokenContract` | `Address` | EKW token contract |
| `NextId` | `u64` | Auto-increment listing ID |
| `Listing(u64)` | `Listing` | Individual listing data |

### Listing struct

```rust
pub struct Listing {
    pub seller: Address,
    pub kwh_amount: i128,      // in stroops (1 kWh = 10_000_000)
    pub price_per_kwh: i128,   // XLM stroops per kWh
    pub active: bool,
}
```

### Functions

| Function | Auth | Description |
|----------|------|-------------|
| `initialize(admin, token_contract)` | — | One-time setup |
| `list(seller, kwh_amount, price_per_kwh)` | `seller` | Escrow tokens, return `listing_id` |
| `buy(buyer, listing_id, xlm_token)` | `buyer` | Atomic swap: XLM → seller, EKW → buyer |
| `cancel(seller, listing_id)` | `seller` | Return escrowed tokens |
| `get_listing(listing_id)` | — | Read listing state |

### Events

| Event | Payload |
|-------|---------|
| `(listed, seller)` | `listing_id: u64` |
| `(sold, listing_id)` | `(buyer, kwh_amount, total_cost)` |

---

## Deploy

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release

# EnergyToken
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/energy_token.wasm \
  --source <your-key> --network testnet

# Initialize EnergyToken
soroban contract invoke --id <TOKEN_ID> --network testnet -- \
  initialize --admin <ADMIN_ADDRESS> --name "EcoVolt Energy" --symbol "EKW"

# Marketplace
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/marketplace.wasm \
  --source <your-key> --network testnet

# Initialize Marketplace
soroban contract invoke --id <MARKET_ID> --network testnet -- \
  initialize --admin <ADMIN_ADDRESS> --token_contract <TOKEN_ID>
```
