use std::sync::Arc;
use tokio::sync::Mutex;

use crate::{
    ffmpeg::parser,
    models::{errors::AppError, metadata::WriteRequest},
};
use tauri::{AppHandle, Emitter};

pub struct WriteState {
    pub process: Arc<Mutex<Option<tokio::process::Child>>>,
}

impl Default for WriteState {
    fn default() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
        }
    }
}

#[tauri::command]
pub async fn write_metadata(
    app: AppHandle,
    state: tauri::State<'_, WriteState>,
    request: WriteRequest,
) -> Result<(), String> {
    write_inner(app, state, request)
        .await
        .map_err(|e| e.to_string())
}

async fn write_inner(
    app: AppHandle,
    state: tauri::State<'_, WriteState>,
    request: WriteRequest,
) -> Result<(), AppError> {
    use std::path::Path;
    use tempfile::Builder;
    use tokio::io::AsyncReadExt;

    let in_place = request.input_path == request.output_path;

    // Determine temp output path
    let parent = Path::new(&request.output_path)
        .parent()
        .unwrap_or(Path::new("."));
    let tmp_file = Builder::new()
        .prefix(".atlas_tmp_")
        .suffix(".mkv")
        .tempfile_in(parent)
        .map_err(AppError::Io)?;
    let tmp_path = tmp_file.path().to_string_lossy().to_string();
    // Keep temp file handle alive during processing
    let _tmp_handle = tmp_file;

    // Write FFMETADATA file for chapters
    let meta_tmp = tempfile::NamedTempFile::with_suffix(".ffmetadata").map_err(AppError::Io)?;
    let meta_path = meta_tmp.path().to_string_lossy().to_string();
    let ffmeta_content = parser::build_ffmetadata(
        &request.metadata,
        &request.chapters,
        // estimate duration from last chapter end or 0
        request.chapters.last().map(|c| c.end_time_ms).unwrap_or(0),
    );
    tokio::fs::write(&meta_path, &ffmeta_content)
        .await
        .map_err(AppError::Io)?;

    // Build ffmpeg args
    let mut args: Vec<String> = vec![
        "-y".into(),
        "-i".into(),
        request.input_path.clone(),
        "-i".into(),
        meta_path.clone(),
        "-map_metadata".into(),
        "1".into(),
        "-map_chapters".into(),
        "1".into(),
    ];

    // Cover art
    if let Some(cover_path) = &request.cover_art_temp_path {
        args.push("-i".into());
        args.push(cover_path.clone());
    }

    // Stream copy or re-encode
    match request.mode {
        crate::models::metadata::WriteMode::MetadataOnly => {
            args.push("-map".into());
            args.push("0".into());
            args.push("-c".into());
            args.push("copy".into());
        }
        crate::models::metadata::WriteMode::Reencode => {
            args.push("-map".into());
            args.push("0".into());
            args.push("-c:v".into());
            args.push("libx264".into());
            args.push("-crf".into());
            args.push(request.video_quality_crf.unwrap_or(23).to_string());
            args.push("-c:a".into());
            args.push("aac".into());
            args.push("-b:a".into());
            args.push("192k".into());
        }
    }

    // Progress output
    args.push("-progress".into());
    args.push("pipe:2".into());
    args.push("-nostats".into());

    args.push(tmp_path.clone());

    // Spawn ffmpeg
    let args_ref: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    let mut child = tokio::process::Command::new("ffmpeg")
        .args(&args_ref)
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(AppError::Io)?;

    {
        let mut proc = state.process.lock().await;
        // We can't move child here without unsafe tricks; parse progress from stderr directly
        drop(proc);
        let _ = proc; // suppress warning
    }

    // Read stderr for progress
    let stderr = child.stderr.take();
    if let Some(mut err_reader) = stderr {
        let app_clone = app.clone();
        tokio::spawn(async move {
            let mut buf = String::new();
            let mut byte_buf = [0u8; 1024];
            loop {
                match err_reader.read(&mut byte_buf).await {
                    Ok(0) => break,
                    Ok(n) => {
                        buf.push_str(&String::from_utf8_lossy(&byte_buf[..n]));
                        // Parse progress lines
                        while let Some(pos) = buf.find('\n') {
                            let line = buf[..pos].to_string();
                            buf = buf[pos + 1..].to_string();
                            if line.starts_with("out_time_ms=") {
                                if let Ok(ms) = line["out_time_ms=".len()..].parse::<u64>() {
                                    // out_time_ms is in microseconds; convert to milliseconds
                                    let _ = app_clone.emit("write-progress", ms / 1000);
                                }
                            }
                        }
                    }
                    Err(_) => break,
                }
            }
        });
    }

    let status = child.wait().await.map_err(AppError::Io)?;
    if !status.success() {
        return Err(AppError::FfmpegFailed("ffmpeg exited with error".into()));
    }

    // Move temp output to final path
    let final_out = if in_place {
        request.input_path.clone()
    } else {
        request.output_path.clone()
    };

    tokio::fs::rename(&tmp_path, &final_out)
        .await
        .map_err(AppError::Io)?;

    let _ = app.emit("write-complete", ());
    Ok(())
}

#[tauri::command]
pub async fn cancel_write(state: tauri::State<'_, WriteState>) -> Result<(), String> {
    let mut proc = state.process.lock().await;
    if let Some(child) = proc.as_mut() {
        let _ = child.kill().await;
    }
    *proc = None;
    Ok(())
}
