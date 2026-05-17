export interface VideoMetadata {
  title: string | null;
  artist: string | null;
  album_artist: string | null;
  album: string | null;
  year: number | null;
  genre: string | null;
  description: string | null;
  comment: string | null;
  copyright: string | null;
  language: string | null;
  encoder: string | null;
  cover_art_base64: string | null;
}

export interface Chapter {
  id: string;
  title: string;
  start_time_ms: number;
  end_time_ms: number;
}

export interface ProbeResult {
  metadata: VideoMetadata;
  chapters: Chapter[];
  duration_ms: number;
  format_name: string;
  video_codec: string;
  audio_codec: string;
  file_size_bytes: number;
}

export interface WriteRequest {
  input_path: string;
  output_path: string;
  metadata: VideoMetadata;
  chapters: Chapter[];
  cover_art_temp_path: string | null;
  mode: "metadata_only" | "reencode";
  video_quality_crf: number | null;
}

export interface FormatInfo {
  supports_chapters: boolean;
  supports_cover_art: boolean;
  supports_metadata: boolean;
  warning: string | null;
}
