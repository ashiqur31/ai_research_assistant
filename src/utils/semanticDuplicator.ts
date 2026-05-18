import { generateEmbedding } from "../services/embedding";
import { cosineSimilarity } from "./cosineSimilarity";
import { logger } from "./logger";

type Evidence = {
  text: string;
  source: string;
  title: string;
};

export async function semanticDuplicate(
  items: Evidence[],
  threshold = 0.85,
): Promise<{ deDuplicated: Evidence[]; duplicatesRemoved: number }> {
  const usableItems = items.filter((item) => item.text.trim());
  const deDuplicated: Evidence[] = [];
  const embeddings: number[][] = [];

  const allEmbeddings = await Promise.all(
    usableItems.map((item) => generateEmbedding(item.text)),
  );

  for (let itemIndex = 0; itemIndex < usableItems.length; itemIndex++) {
    const item = usableItems[itemIndex];
    const embedding = allEmbeddings[itemIndex];
    let isDuplicate = false;

    for (let i = 0; i < embeddings.length; i++) {
      const similarity = cosineSimilarity(embedding, embeddings[i]);

      if (similarity >= threshold) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      deDuplicated.push(item);
      embeddings.push(embedding);
    }
  }

  logger.info(
    {
      original_count: usableItems.length,
      duplicate_count: deDuplicated.length,
      removed_duplicate: usableItems.length - deDuplicated.length,
      threshold,
    },
    "Semantic duplication completed",
  );

  return {
    deDuplicated,
    duplicatesRemoved: usableItems.length - deDuplicated.length,
  };
}
