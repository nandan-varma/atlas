use base64::Engine;
use std::path::Path;
use tempfile::NamedTempFile;

use crate::{
    ffmpeg::{parser, runner},
    models::{errors::AppError, metadata::ProbeResult},
};

#[tauri::command]
pub async fn probe_file(path: String) -> Result<ProbeResult, String> {
    probe_inner(&path).await.map_err(|e| e.to_string())
}

async fn probe_inner(path: &str) -> Result<ProbeResult, AppError> {
    // Run ffprobe for metadata + chapters
    let probe_output = runner::run(
        "ffprobe",
        &[
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            "-show_chapters",
            path,
        ],
    )
    .await?;

    if !probe_output.status.success() {
        return Err(AppError::FfprobeFailed(runner::stderr_str(&probe_output)));
    }

    let json = runner::stdout_str(&probe_output);
    let (mut metadata, chapters, duration_ms, format_name, video_codec, audio_codec, file_size_bytes) =
        parser::parse_probe_json(&json).map_err(AppError::Other)?;

    // Extract cover art if present
    if let Ok(cover) = extract_cover_art(path).await {
        metadata.cover_art_base64 = Some(cover);
    }

    Ok(ProbeResult {
        metadata,
        chapters,
        duration_ms,
        format_name,
        video_codec,
        audio_codec,
        file_size_bytes,
    })
}

async fn extract_cover_art(video_path: &str) -> Result<String, AppError> {
    let tmp = NamedTempFile::with_suffix(".png").map_err(AppError::Io)?;
    let tmp_path = tmp.path().to_string_lossy().to_string();

    let output = runner::run(
        "ffmpeg",
        &[
            "-y",
            "-i", video_path,
            "-an",
            "-vf", "select=eq(n\\,0)",
            "-vframes", "1",
            "-map", "0:v:0",
            "-update", "1",
            &tmp_path,
        ],
    )
    .await?;

    // Also try extracting attached picture stream
    if !output.status.success() || !Path::new(&tmp_path).exists() {
        let output2 = runner::run(
            "ffmpeg",
            &[
                "-y",
                "-i", video_path,
                "-an",
                "-vcodec", "copy",
                "-map", "0:v",
                &tmp_path,
            ],
        )
        .await?;
        if !output2.status.success() {
            return Err(AppError::Other("No cover art found".into()));
        }
    }

    let bytes = tokio::fs::read(&tmp_path).await.map_err(AppError::Io)?;
    if bytes.is_empty() {
        return Err(AppError::Other("Cover art empty".into()));
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    // Detect mime type by magic bytes
    let mime = if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        "image/jpeg"
    } else {
        "image/png"
    };

    Ok(format!("data:{mime};base64,{b64}"))
}
