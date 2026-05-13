import { title } from "node:process";
import { z } from "zod";

const EvidenceSchema = z.object({
  text: z.string(),
  source: z.string().url(),
  title: z.string()
})

export const ResearchSchema = z.object({
  claims: z.array(EvidenceSchema).default([]),
  quotes: z.array(EvidenceSchema).default([]),
  statistics: z.array(EvidenceSchema).default([])
})

export type ResearchData = z.infer<typeof ResearchSchema>