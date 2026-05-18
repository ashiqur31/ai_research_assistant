export type SourceCategory =
  | "academic"
  | "government"
  | "news"
  | "organization"
  | "blog"
  | "seo"
  | "unknown";

export type credibilityResult = {
  domain: string;
  category: SourceCategory;
  credibility: number;
};
