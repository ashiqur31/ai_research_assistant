import { ResearchData } from "../types/research";

export function generateMarkdownReport(data: ResearchData) {
  return `
    # Research Report

    ## Key Claims

    ${data.claims.map(claim => `
      ### ${claim.title}

      -  ${claim.text}\n 
      Source: ${claim.source}`).join("\n")}
    
    ----

    ## Quotes

    ${data.quotes.map(quote => `- ${quote.text}\n Source: ${quote.source}`).join("\n\n")}

    ----

    ## Statistics

    ${data.statistics.map(stats => `- ${stats.text}\n Source: ${stats.source}`).join("\n\n")}
  `
}