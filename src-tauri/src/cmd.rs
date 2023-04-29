use crate::error::MangatraError;
use base64::{engine::general_purpose, Engine as _};
use image::ImageFormat;
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use std::path::Path;

#[derive(Serialize, Deserialize)]
struct FileEntry {
    children: Option<Vec<FileEntry>>,
    name: Option<String>,
    path: String,
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    name.to_string()
}

#[tauri::command(async)]
pub fn get_image(image_path: &str) -> String {
    let image = image::open(image_path).unwrap();

    let mut w = Cursor::new(Vec::new());
    image.write_to(&mut w, ImageFormat::Jpeg).unwrap();

    println!("TEST");

    general_purpose::STANDARD_NO_PAD.encode(w.into_inner().as_slice())
}

#[tauri::command]
pub fn filter_tree(file_tree: &str, images: bool) -> Result<String, MangatraError> {
    let file_tree: Vec<FileEntry> = serde_json::from_str(file_tree)?;
    let mut filtered_tree = Vec::new();

    for file in file_tree {
        if let Some(children) = file.children {
            let filtered_children = filter_tree(&serde_json::to_string(&children)?, images)?;

            let filtered_children = serde_json::from_str::<Vec<FileEntry>>(&filtered_children)?;

            if !filtered_children.is_empty() {
                filtered_tree.push(FileEntry {
                    children: Some(filtered_children),
                    name: file.name,
                    path: file.path,
                });
            }
        } else if let Some(extension) = Path::new(&file.path).extension() {
            match extension.to_str() {
                Some("jpg" | "jpeg" | "png" | "webp" | "tiff") if images => {
                    filtered_tree.push(file);
                }
                Some("json") if !images => {
                    filtered_tree.push(file);
                }
                _ => {}
            }
        }
    }

    Ok(serde_json::to_string(&filtered_tree)?)
}
