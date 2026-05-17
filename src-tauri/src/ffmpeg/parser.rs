use serde_json::Value;

use crate::models::metadata::{Chapter, VideoMetadata};

pub fn parse_probe_json(json: &str) -> Result<(VideoMetadata, Vec<Chapter>, u64, String, String, String, u64), String> {
    let v: Value = serde_json::from_str(json).map_err(|e| e.to_string())?;

    let format = &v["format"];
    let tags = &format["tags"];

    fn tag(tags: &Value, keys: &[&str]) -> Option<String> {
        for k in keys {
            if let Some(s) = tags.get(k).and_then(|v| v.as_str()) {
                if !s.is_empty() {
                    return Some(s.to_string());
                }
            }
            // Try uppercase variant
            let upper = k.to_uppercase();
            if let Some(s) = tags.get(upper.as_str()).and_then(|v| v.as_str()) {
                if !s.is_empty() {
                    return Some(s.to_string());
                }
            }
        }
        None
    }

    let metadata = VideoMetadata {
        title: tag(tags, &["title"]),
        artist: tag(tags, &["artist", "ARTIST"]),
        album_artist: tag(tags, &["album_artist", "ALBUM_ARTIST"]),
        album: tag(tags, &["album"]),
        year: tag(tags, &["date", "year", "DATE", "YEAR"]).and_then(|s| {
            s.chars().take(4).collect::<String>().parse::<i32>().ok()
        }),
        genre: tag(tags, &["genre"]),
        description: tag(tags, &["description", "DESCRIPTION", "comment", "COMMENT"]),
        comment: tag(tags, &["comment", "COMMENT"]),
        copyright: tag(tags, &["copyright", "COPYRIGHT"]),
        language: tag(tags, &["language", "LANGUAGE"]),
        encoder: tag(tags, &["encoder", "ENCODER"]),
        cover_art_base64: None, // filled by probe_file command
    };

    let duration_ms = format["duration"]
        .as_str()
        .and_then(|s| s.parse::<f64>().ok())
        .map(|d| (d * 1000.0) as u64)
        .unwrap_or(0);

    let format_name = format["format_name"]
        .as_str()
        .unwrap_or("unknown")
        .split(',')
        .next()
        .unwrap_or("unknown")
        .to_string();

    let file_size_bytes = format["size"]
        .as_str()
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(0);

    let streams = v["streams"].as_array().cloned().unwrap_or_default();
    let video_codec = streams
        .iter()
        .find(|s| s["codec_type"].as_str() == Some("video"))
        .and_then(|s| s["codec_name"].as_str())
        .unwrap_or("unknown")
        .to_string();
    let audio_codec = streams
        .iter()
        .find(|s| s["codec_type"].as_str() == Some("audio"))
        .and_then(|s| s["codec_name"].as_str())
        .unwrap_or("unknown")
        .to_string();

    // Parse chapters
    let raw_chapters = v["chapters"].as_array().cloned().unwrap_or_default();
    let mut chapters: Vec<Chapter> = raw_chapters
        .iter()
        .enumerate()
        .map(|(i, c)| {
            let chapter_tags = &c["tags"];
            let title = chapter_tags["title"]
                .as_str()
                .or_else(|| chapter_tags["TITLE"].as_str())
                .unwrap_or(&format!("Chapter {}", i + 1))
                .to_string();

            let time_base_num = c["time_base"]
                .as_str()
                .and_then(|tb| {
                    let parts: Vec<&str> = tb.split('/').collect();
                    if parts.len() == 2 {
                        let num = parts[0].parse::<f64>().ok()?;
                        let den = parts[1].parse::<f64>().ok()?;
                        Some(num / den)
                    } else {
                        None
                    }
                })
                .unwrap_or(1.0 / 1000.0);

            let start_ms = c["start"]
                .as_i64()
                .map(|t| (t as f64 * time_base_num * 1000.0) as u64)
                .unwrap_or(0);
            let end_ms = c["end"]
                .as_i64()
                .map(|t| (t as f64 * time_base_num * 1000.0) as u64)
                .unwrap_or(duration_ms);

            Chapter {
                id: uuid::Uuid::new_v4().to_string(),
                title,
                start_time_ms: start_ms,
                end_time_ms: end_ms,
            }
        })
        .collect();

    // Ensure end times are consistent
    for i in 0..chapters.len() {
        if i + 1 < chapters.len() {
            chapters[i].end_time_ms = chapters[i + 1].start_time_ms.saturating_sub(1);
        } else {
            chapters[i].end_time_ms = duration_ms;
        }
    }

    Ok((metadata, chapters, duration_ms, format_name, video_codec, audio_codec, file_size_bytes))
}

pub fn build_ffmetadata(metadata: &crate::models::metadata::VideoMetadata, chapters: &[Chapter], duration_ms: u64) -> String {
    let mut out = String::from(";FFMETADATA1\n");

    if let Some(v) = &metadata.title { out.push_str(&format!("title={v}\n")); }
    if let Some(v) = &metadata.artist { out.push_str(&format!("artist={v}\n")); }
    if let Some(v) = &metadata.album_artist { out.push_str(&format!("album_artist={v}\n")); }
    if let Some(v) = &metadata.album { out.push_str(&format!("album={v}\n")); }
    if let Some(v) = metadata.year { out.push_str(&format!("date={v}\n")); }
    if let Some(v) = &metadata.genre { out.push_str(&format!("genre={v}\n")); }
    if let Some(v) = &metadata.comment { out.push_str(&format!("comment={v}\n")); }
    if let Some(v) = &metadata.description { out.push_str(&format!("description={v}\n")); }
    if let Some(v) = &metadata.copyright { out.push_str(&format!("copyright={v}\n")); }
    if let Some(v) = &metadata.language { out.push_str(&format!("language={v}\n")); }

    for chapter in chapters {
        out.push_str("\n[CHAPTER]\nTIMEBASE=1/1000\n");
        out.push_str(&format!("START={}\n", chapter.start_time_ms));
        let end = if chapter.end_time_ms == 0 { duration_ms } else { chapter.end_time_ms };
        out.push_str(&format!("END={end}\n"));
        out.push_str(&format!("title={}\n", chapter.title));
    }

    out
}
