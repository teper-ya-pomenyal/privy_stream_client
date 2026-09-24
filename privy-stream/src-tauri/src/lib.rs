mod secrets;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            secrets::tokens_get,
            secrets::tokens_set,
            secrets::tokens_delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running privy_stream");
}
