import { openai } from "../services/openai";
import { logger } from "../utils/logger";
import { cleanJsonResponse } from "../utils/jsonCleaner";
import { safeParseResearch } from "../utils/safeParse";

export async function extractResearchData(content: string, sourceurl: string, sourceTitle: string) {
  try {
    logger.info("Starting Extraction");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract structured research information. 
                    IMPORTANT:
                    - Return only valid JSON
                    - Include the exact source url provided
                    - Do not wrap in markdown
                    - Use exact field names:
                      - claims
                      - quotes
                      - statistics
                    - Use this exact source URL: ${sourceurl}
                    - Use this exact source title: ${sourceTitle}

                    Use this Schema:
                          {
                            "claims": [{
                                        "text": string[],
                                        "source": string,
                                        "title": string
                                      }],
                            "quotes": [{
                                        "text": string[],
                                        "source": string
                                      }],
                            "statistics": [{
                                        "text": string[],
                                        "source": string
                                      }],
                          }`,
        },
        {
          role: "user",
          content: content.slice(0, 8000),
        },
      ],
      temperature: 0,
    });
    // console.log("------------------------",response)
    const raw = response.choices[0].message.content || "{}";
    // console.log("\nRaw model output\n");
    // console.log(raw);
    const cleaned = cleanJsonResponse(raw);
    return safeParseResearch(cleaned);
  } catch (error: any) {
    logger.error({ error: error.message }, "Extraction failed");
    return {
      claims: [],
      quotes: [],
      statistics: [],
    };
  }
}
