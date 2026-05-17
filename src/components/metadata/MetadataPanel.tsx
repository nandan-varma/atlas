import { useState } from "react";
import { useMetadataStore } from "@/store";
import { CoverArtEditor } from "./CoverArtEditor";
import { SelectField, TextAreaField, TextField } from "./MetadataField";

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Short",
  "Sport",
  "Thriller",
  "Western",
  "Biography",
  "Family",
  "History",
];

const LANGUAGES = [
  "eng",
  "fra",
  "deu",
  "spa",
  "ita",
  "por",
  "jpn",
  "zho",
  "kor",
  "ara",
  "rus",
  "hin",
  "und",
];

type Tab = "general" | "details";

export function MetadataPanel() {
  const [tab, setTab] = useState<Tab>("general");
  const current = useMetadataStore((s) => s.current);
  const updateField = useMetadataStore((s) => s.updateField);

  const str = (v: string | null) => v ?? "";
  const num = (v: number | null) => (v != null ? String(v) : "");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[--color-border] shrink-0">
        {(["general", "details"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors cursor-pointer ${
              tab === t
                ? "text-[--color-foreground] border-b-2 border-[--color-accent]"
                : "text-[--color-muted] hover:text-[--color-foreground]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {tab === "general" ? (
          <>
            <TextField
              label="Title"
              placeholder="Video title"
              value={str(current.title)}
              onChange={(e) => updateField("title", e.target.value || null)}
            />
            <TextField
              label="Artist"
              placeholder="Artist / Director"
              value={str(current.artist)}
              onChange={(e) => updateField("artist", e.target.value || null)}
            />
            <TextField
              label="Album"
              placeholder="Album / Series"
              value={str(current.album)}
              onChange={(e) => updateField("album", e.target.value || null)}
            />
            <TextField
              label="Album Artist"
              placeholder="Album artist"
              value={str(current.album_artist)}
              onChange={(e) => updateField("album_artist", e.target.value || null)}
            />
            <div className="flex gap-2">
              <TextField
                label="Year"
                placeholder="2024"
                type="number"
                min={1888}
                max={2100}
                value={num(current.year)}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  updateField("year", Number.isNaN(v) ? null : v);
                }}
                className="flex-1"
              />
              <SelectField
                label="Genre"
                options={GENRES}
                value={str(current.genre)}
                onChange={(v) => updateField("genre", v || null)}
              />
            </div>
            <TextAreaField
              label="Description"
              placeholder="Video description…"
              value={str(current.description)}
              onChange={(e) => updateField("description", e.target.value || null)}
            />
            <CoverArtEditor />
          </>
        ) : (
          <>
            <TextAreaField
              label="Comment"
              placeholder="Comment…"
              value={str(current.comment)}
              onChange={(e) => updateField("comment", e.target.value || null)}
            />
            <TextField
              label="Copyright"
              placeholder="© 2024 Studio Name"
              value={str(current.copyright)}
              onChange={(e) => updateField("copyright", e.target.value || null)}
            />
            <SelectField
              label="Language"
              options={LANGUAGES}
              value={str(current.language)}
              onChange={(v) => updateField("language", v || null)}
            />
            <TextField
              label="Encoder"
              placeholder="Encoding software"
              value={str(current.encoder)}
              onChange={(e) => updateField("encoder", e.target.value || null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
