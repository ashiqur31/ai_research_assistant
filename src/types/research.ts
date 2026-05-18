import { z } from "zod";

const EvidenceSchema = z.object({
  text: z.string().min(1),
  source: z.string().min(1),
  title: z.string().default("Untitled source"),
});

export const ResearchSchema = z.object({
  claims: z.array(EvidenceSchema).default([]),
  quotes: z.array(EvidenceSchema).default([]),
  statistics: z.array(EvidenceSchema).default([]),
  duplicatesRemoved: z.number().nonnegative().optional(),
});

export type ResearchData = z.infer<typeof ResearchSchema>;
