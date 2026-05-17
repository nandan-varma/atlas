use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VideoMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album_artist: Option<String>,
    pub album: Option<String>,
    pub year: Option<i32>,
    pub genre: Option<String>,
    pub description: Option<String>,
    pub comment: Option<String>,
    pub copyright: Option<String>,
    pub language: Option<String>,
    pub encoder: Option<String>,
    pub cover_art_base64: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,
    pub title: String,
    pub start_time_ms: u64,
    pub end_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProbeResult {
    pub metadata: VideoMetadata,
    pub chapters: Vec<Chapter>,
    pub duration_ms: u64,
    pub format_name: String,
    pub video_codec: String,
    pub audio_codec: String,
    pub file_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WriteMode {
    MetadataOnly,
    Reencode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteRequest {
    pub input_path: String,
    pub output_path: String,
    pub metadata: VideoMetadata,
    pub chapters: Vec<Chapter>,
    pub cover_art_temp_path: Option<String>,
    pub mode: WriteMode,
    pub video_quality_crf: Option<u8>,
}
