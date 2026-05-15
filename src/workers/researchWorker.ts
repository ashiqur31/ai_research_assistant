import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { searchWeb } from "../tools/tavily";
import { extractResearchData } from "../services/extractor";
import { aggregateResearch } from "../services/aggregator";
import { generateMarkdownReport } from "../services/reportGenerator";

new Worker(
  "research-queue",
  async (job) => {
    console.log("Processing: ", job.data.query);
    const results = await searchWeb(job.data.query);
    const extractedResults = await Promise.all(
      results.map((result) =>
        extractResearchData(result.content, result.url, result.title),
      ),
    );
    const aggregated = aggregateResearch(extractedResults);
    const report = generateMarkdownReport(aggregated);
    console.log(report);
    return report;
  },
  {
    connection,
  },
);
