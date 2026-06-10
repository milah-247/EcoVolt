//! Marketplace — P2P energy listing and atomic swap contract.
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Map, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub seller: Address,
    /// kWh offered (in stroops: 1 kWh = 10_000_000)
    pub kwh_amount: i128,
    /// Price per kWh in XLM stroops
    pub price_per_kwh: i128,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    NextId,
    Listing(u64),
}

#[contract]
pub struct Marketplace;

#[contractimpl]
impl Marketplace {
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::NextId, &0u64);
    }

    /// Create a new energy listing. Seller's tokens are escrowed.
    pub fn list(env: Env, seller: Address, kwh_amount: i128, price_per_kwh: i128) -> u64 {
        seller.require_auth();
        assert!(kwh_amount > 0 && price_per_kwh > 0, "invalid params");

        let token: Address = env.storage().instance().get(&DataKey::TokenContract).unwrap();
        let token_client = token::TokenClient::new(&env, &token);

        // Escrow energy tokens into marketplace contract
        token_client.transfer(&seller, &env.current_contract_address(), &kwh_amount);

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap();
        env.storage().instance().set(
            &DataKey::Listing(id),
            &Listing { seller: seller.clone(), kwh_amount, price_per_kwh, active: true },
        );
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        env.events().publish((Symbol::new(&env, "listed"), seller), id);
        id
    }

    /// Buy energy from a listing. Buyer pays XLM; tokens released to buyer.
    pub fn buy(env: Env, buyer: Address, listing_id: u64, xlm_token: Address) {
        buyer.require_auth();

        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found");

        assert!(listing.active, "listing not active");

        let total_cost = listing.kwh_amount * listing.price_per_kwh / 10_000_000;
        let xlm_client = token::TokenClient::new(&env, &xlm_token);

        // Transfer XLM from buyer to seller
        xlm_client.transfer(&buyer, &listing.seller, &total_cost);

        // Release escrowed energy tokens to buyer
        let token: Address = env.storage().instance().get(&DataKey::TokenContract).unwrap();
        let token_client = token::TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &buyer, &listing.kwh_amount);

        listing.active = false;
        env.storage().instance().set(&DataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "sold"), listing_id),
            (buyer, listing.kwh_amount, total_cost),
        );
    }

    /// Cancel a listing and return escrowed tokens to seller.
    pub fn cancel(env: Env, seller: Address, listing_id: u64) {
        seller.require_auth();

        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found");

        assert!(listing.active, "listing not active");
        assert_eq!(listing.seller, seller, "not your listing");

        let token: Address = env.storage().instance().get(&DataKey::TokenContract).unwrap();
        let token_client = token::TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &seller, &listing.kwh_amount);

        listing.active = false;
        env.storage().instance().set(&DataKey::Listing(listing_id), &listing);
    }

    pub fn get_listing(env: Env, listing_id: u64) -> Listing {
        env.storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found")
    }
}
