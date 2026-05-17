use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FormatInfo {
    pub supports_chapters: bool,
    pub supports_cover_art: bool,
    pub supports_metadata: bool,
    pub warning: Option<String>,
}

#[tauri::command]
pub fn get_format_info(format_name: String) -> FormatInfo {
    match format_name.as_str() {
        "mp4" | "m4v" | "mov" => FormatInfo {
            supports_chapters: true,
            supports_cover_art: true,
            supports_metadata: true,
            warning: None,
        },
        "matroska" | "mkv" | "webm" if format_name != "webm" => FormatInfo {
            supports_chapters: true,
            supports_cover_art: true,
            supports_metadata: true,
            warning: None,
        },
        "webm" => FormatInfo {
            supports_chapters: true,
            supports_cover_art: false,
            supports_metadata: true,
            warning: Some(
                "WebM has limited metadata support. Cover art cannot be embedded.".into(),
            ),
        },
        "avi" => FormatInfo {
            supports_chapters: false,
            supports_cover_art: false,
            supports_metadata: true,
            warning: Some(
                "AVI does not support chapters or cover art. Export as MP4 or MKV to enable these features.".into(),
            ),
        },
        _ => FormatInfo {
            supports_chapters: true,
            supports_cover_art: false,
            supports_metadata: true,
            warning: Some(format!("Limited support for '{format_name}' format.")),
        },
    }
}
