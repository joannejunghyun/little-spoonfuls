import type { BlwType } from "@/lib/blw-context";
import type { WeaningStage } from "@/lib/weaning-context";
import { RAG_DOCUMENTS, type RagDocument, type RagLanguage } from "@/lib/rag/documents";

export interface RetrieveMealKnowledgeInput {
  query: string;
  stage: WeaningStage["id"];
  language: RagLanguage;
  cuisine: string;
  blwType: BlwType;
  matchCount?: number;
}

export interface RetrievedRagDocument extends RagDocument {
  score: number;
  matchedTags: string[];
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKC");
}

function appliesTo<T extends string>(
  values: Array<T | "all"> | undefined,
  current: T,
): boolean {
  return !values || values.includes("all") || values.includes(current);
}

function scoreDocument(doc: RagDocument, input: RetrieveMealKnowledgeInput): RetrievedRagDocument | null {
  if (doc.lang !== input.language) return null;
  if (!appliesTo(doc.stages, input.stage)) return null;
  if (!appliesTo(doc.blwTypes, input.blwType)) return null;

  const cuisine = ["korean", "western", "chinese", "mix"].includes(input.cuisine)
    ? input.cuisine as "korean" | "western" | "chinese" | "mix"
    : "mix";
  if (!appliesTo(doc.cuisines, cuisine)) return null;

  const haystack = normalize(`${input.query} ${input.stage} ${input.cuisine} ${input.blwType}`);
  const matchedTags = doc.tags.filter((tag) => haystack.includes(normalize(tag)));

  let score = 0;
  score += matchedTags.length * 5;
  score += doc.stages.includes(input.stage) ? 3 : 0;
  score += doc.cuisines?.includes(cuisine) ? 2 : 0;
  score += doc.blwTypes?.includes(input.blwType) ? 2 : 0;

  const titleTokens = normalize(doc.title).split(/[\s:/,-]+/).filter(Boolean);
  score += titleTokens.filter((token) => token.length > 1 && haystack.includes(token)).length;

  if (score <= 0) return null;
  return { ...doc, score, matchedTags };
}

export function retrieveMealKnowledge(input: RetrieveMealKnowledgeInput): RetrievedRagDocument[] {
  return RAG_DOCUMENTS
    .map((doc) => scoreDocument(doc, input))
    .filter((doc): doc is RetrievedRagDocument => doc !== null)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, input.matchCount ?? 5);
}

export function formatRetrievedContext(docs: RetrievedRagDocument[]): string {
  if (docs.length === 0) {
    return "No request-specific reference passages were retrieved. Follow the static safety and stage rules.";
  }

  return docs
    .map((doc, index) => {
      const tags = doc.matchedTags.length > 0 ? `; matched: ${doc.matchedTags.join(", ")}` : "";
      return `[${index + 1}] ${doc.title} (${doc.source}${tags})\n${doc.content}`;
    })
    .join("\n\n");
}
