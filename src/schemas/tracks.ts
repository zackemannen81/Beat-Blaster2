import { z } from 'zod';

export const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  inputOffsetMs: z.number(),
  lengthSec: z.number(),
  fileOgg: z.string(),
  fileMp3: z.string(),
  difficultyProfileId: z.string(),
  hash: z.string(),
});

export const tracksSchema = z.array(trackSchema);

export type Track = z.infer<typeof trackSchema>;
