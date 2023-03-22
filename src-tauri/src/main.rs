#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use base64::{
    engine::{self, general_purpose},
    Engine as _,
};
use image::ImageFormat;
use std::collections::HashMap;
use std::io::{BufWriter, Cursor};
use tauri::http::ResponseBuilder;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use url::Url;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    name.to_string()
}

#[tauri::command(async)]
fn get_image(name: &str) -> String {
    let image = image::open(format!(
        "C:/Users/Ethan/Desktop/repo/translation/target/debug/{}",
        name
    ))
    .unwrap();

    let mut w = Cursor::new(Vec::new());
    image.write_to(&mut w, ImageFormat::Jpeg).unwrap();

    println!("TEST");

    general_purpose::STANDARD_NO_PAD.encode(w.into_inner().as_slice())
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));

    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_image])
        .menu(menu)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
