import { researchQueue } from "./queues/researchQueue";
import pLimit from "p-limit";

async function main() {
  await researchQueue.add("research-job", {
    query: "Best AI Interview paltform",
  });
  console.log("Research Job added")
}

main();
