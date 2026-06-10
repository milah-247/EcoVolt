//! EnergyToken — SEP-41 fungible token representing 1 kWh of solar energy.
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    Metadata,
}

#[contracttype]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}

#[contract]
pub struct EnergyToken;

#[contractimpl]
impl EnergyToken {
    /// Initialize token. One-time call.
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(
            &DataKey::Metadata,
            &TokenMetadata { name, symbol, decimals: 7 },
        );
    }

    /// Mint `amount` tokens to `to`. Admin only.
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        assert!(amount > 0, "amount must be positive");
        let client = token::StellarAssetClient::new(&env, &env.current_contract_address());
        client.mint(&to, &amount);
    }

    /// Burn `amount` tokens from caller (energy consumed / settled).
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let client = token::TokenClient::new(&env, &env.current_contract_address());
        client.burn(&from, &amount);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn metadata(env: Env) -> TokenMetadata {
        env.storage().instance().get(&DataKey::Metadata).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, EnergyToken);
        let client = EnergyTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.initialize(
            &admin,
            &String::from_str(&env, "EcoVolt Energy"),
            &String::from_str(&env, "EKW"),
        );
        assert_eq!(client.admin(), admin);
    }
}
