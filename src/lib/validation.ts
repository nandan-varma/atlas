import { z } from "zod";

export const metadataSchema = z.object({
  title: z.string().nullable(),
  artist: z.string().nullable(),
  album_artist: z.string().nullable(),
  album: z.string().nullable(),
  year: z.number().int().min(1888).max(2100).nullable().or(z.literal(null)),
  genre: z.string().nullable(),
  description: z.string().nullable(),
  comment: z.string().nullable(),
  copyright: z.string().nullable(),
  language: z.string().nullable(),
  encoder: z.string().nullable(),
});

export type MetadataFormValues = z.infer<typeof metadataSchema>;
