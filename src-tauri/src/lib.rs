mod commands;
mod ffmpeg;
mod models;

use commands::{
    formats::get_format_info,
    probe::probe_file,
    thumbnail::extract_thumbnail,
    write::{cancel_write, write_metadata, WriteState},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(WriteState::default())
        .invoke_handler(tauri::generate_handler![
            probe_file,
            write_metadata,
            cancel_write,
            extract_thumbnail,
            get_format_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
