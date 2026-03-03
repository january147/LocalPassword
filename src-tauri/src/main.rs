// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::list_passwords,
            commands::add_password,
            commands::update_password,
            commands::delete_password,
            commands::generate_password,
            commands::export_passwords,
            commands::import_passwords,
            commands::init_database,
            commands::cleanup_database
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
