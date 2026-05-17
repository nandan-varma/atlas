use base64::Engine;
use tempfile::NamedTempFile;

use crate::{ffmpeg::runner, models::errors::AppError};

#[tauri::command]
pub async fn extract_thumbnail(
    path: String,
    timestamp_ms: u64,
    width: u32,
    height: u32,
) -> Result<String, String> {
    extract_inner(&path, timestamp_ms, width, height)
        .await
        .map_err(|e| e.to_string())
}

async fn extract_inner(
    path: &str,
    timestamp_ms: u64,
    width: u32,
    height: u32,
) -> Result<String, AppError> {
    let total_secs = timestamp_ms as f64 / 1000.0;
    let timestamp = format!("{:.3}", total_secs);
    let scale = format!("scale={width}:{height}:force_original_aspect_ratio=decrease");

    let tmp = NamedTempFile::with_suffix(".jpg").map_err(AppError::Io)?;
    let tmp_path = tmp.path().to_string_lossy().to_string();

    let output = runner::run(
        "ffmpeg",
        &[
            "-y",
            "-ss", &timestamp,
            "-i", path,
            "-vframes", "1",
            "-vf", &scale,
            "-q:v", "3",
            &tmp_path,
        ],
    )
    .await?;

    if !output.status.success() {
        return Err(AppError::FfmpegFailed(runner::stderr_str(&output)));
    }

    let bytes = tokio::fs::read(&tmp_path).await.map_err(AppError::Io)?;
    if bytes.is_empty() {
        return Err(AppError::Other("Empty thumbnail".into()));
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:image/jpeg;base64,{b64}"))
}
