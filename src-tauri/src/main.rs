#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::window::Window;
use tauri::Manager;
use tauri::{CustomMenuItem, Menu, MenuItem, PhysicalSize, Submenu};

mod cmd;
mod error;

use cmd::{filter_tree, get_image, greet};
fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));

    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    tauri::Builder::default()
        .setup(|app| {
            let main_window: Window = app.get_window("main").unwrap();
            main_window.set_min_size(Some(PhysicalSize::new(800, 600)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_image, filter_tree])
        .menu(menu)
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
