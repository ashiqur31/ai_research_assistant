import { searchWeb } from "./tools/tavily";
import { extractResearchData } from "./services/extractor";
import { aggregateResearch } from "./services/aggregator";
import { generateMarkdownReport } from "./services/reportGenerator";
import pLimit from "p-limit";

async function main() {
  const results = await searchWeb("Best Eye clinic in Guwahati");
  const limit = pLimit(3);
  const extractedResults = await Promise.all(
    results.map((result) =>
      limit(() => extractResearchData(result.content, result.url, result.title)),
    ),
  );
  const aggregate = aggregateResearch(extractedResults);
  const report = generateMarkdownReport(aggregate);
  console.log("\nFinal Report\n");
  console.log(report);
}

main();
