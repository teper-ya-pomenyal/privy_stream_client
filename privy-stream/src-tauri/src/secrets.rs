//! Токены по узлам в системном хранилище секретов
//! (macOS Keychain, Windows Credential Manager, Secret Service на Linux).
//! Одна запись на узел: service = идентификатор приложения, account = host.

use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE: &str = "stream.privy.client";

#[derive(Serialize, Deserialize)]
pub struct Tokens {
    access: String,
    refresh: String,
}

fn entry(host: &str) -> Result<Entry, String> {
    Entry::new(SERVICE, host).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tokens_get(host: String) -> Result<Option<Tokens>, String> {
    match entry(&host)?.get_password() {
        Ok(json) => serde_json::from_str(&json).map(Some).map_err(|e| e.to_string()),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn tokens_set(host: String, tokens: Tokens) -> Result<(), String> {
    let json = serde_json::to_string(&tokens).map_err(|e| e.to_string())?;
    entry(&host)?.set_password(&json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tokens_delete(host: String) -> Result<(), String> {
    match entry(&host)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
