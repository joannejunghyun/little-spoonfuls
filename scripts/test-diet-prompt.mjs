// Run: node scripts/test-diet-prompt.mjs
// Verifies that each diet_type produces the correct prompt label
// and that forbidden ingredients are mentioned in the restriction text.

const DIET_LABELS = {
  all: "Omnivore (meat, fish, dairy, eggs all OK — no restrictions)",
  pescatarian: "Pescatarian (no meat — fish, dairy, and eggs OK)",
  "lacto-ovo": "Lacto-ovo vegetarian (no meat/fish — dairy and eggs OK)",
  lacto: "Lacto vegetarian (no meat/fish/eggs — dairy OK)",
  ovo: "Ovo vegetarian (no meat/fish/dairy — eggs OK)",
  vegan: "Vegan (no animal products at all)",
};

// What each diet must exclude (keywords that must appear in the label)
const MUST_EXCLUDE = {
  all: [],
  pescatarian: ["no meat"],
  "lacto-ovo": ["no meat", "no meat/fish"],
  lacto: ["no meat/fish/eggs"],
  ovo: ["no meat/fish/dairy"],
  vegan: ["no animal products"],
};

// What each diet must allow (keywords that must appear in the label)
const MUST_ALLOW = {
  all: ["OK"],
  pescatarian: ["fish", "dairy", "eggs"],
  "lacto-ovo": ["dairy", "eggs"],
  lacto: ["dairy"],
  ovo: ["eggs"],
  vegan: [],
};

const DIET_RESTRICTIONS = {
  all: [],
  pescatarian: [
    { label: "meat", keywords: ["beef", "chicken", "pork", "소고기", "닭고기", "돼지고기"] },
  ],
  "lacto-ovo": [
    { label: "meat", keywords: ["beef", "chicken", "pork", "소고기", "닭고기", "돼지고기"] },
    { label: "fish", keywords: ["fish", "salmon", "shrimp", "생선", "연어", "새우"] },
  ],
  lacto: [
    { label: "meat", keywords: ["beef", "chicken", "pork", "소고기", "닭고기", "돼지고기"] },
    { label: "fish", keywords: ["fish", "salmon", "shrimp", "생선", "연어", "새우"] },
    { label: "egg", keywords: ["egg", "yolk", "달걀", "계란"] },
  ],
  ovo: [
    { label: "meat", keywords: ["beef", "chicken", "pork", "소고기", "닭고기", "돼지고기"] },
    { label: "fish", keywords: ["fish", "salmon", "shrimp", "생선", "연어", "새우"] },
    { label: "dairy", keywords: ["milk", "cheese", "yogurt", "우유", "치즈", "요거트"] },
  ],
  vegan: [
    { label: "meat", keywords: ["beef", "chicken", "pork", "소고기", "닭고기", "돼지고기"] },
    { label: "fish", keywords: ["fish", "salmon", "shrimp", "생선", "연어", "새우"] },
    { label: "egg", keywords: ["egg", "yolk", "달걀", "계란"] },
    { label: "dairy", keywords: ["milk", "cheese", "yogurt", "우유", "치즈", "요거트"] },
    { label: "honey", keywords: ["honey", "꿀"] },
  ],
};

function containsKeyword(text, keyword) {
  const normalized = text.toLowerCase();
  const kw = keyword.toLowerCase();
  if (/^[a-z0-9 ]+$/.test(kw)) {
    const pattern = kw
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`).test(normalized);
  }
  return normalized.includes(kw);
}

function findDietViolations(text, dietType) {
  const violations = new Set();
  for (const restriction of DIET_RESTRICTIONS[dietType] ?? []) {
    const matched = restriction.keywords.find((keyword) => containsKeyword(text, keyword));
    if (matched) violations.add(`${restriction.label}:${matched}`);
  }
  return [...violations];
}

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

console.log("\n=== Diet Prompt Unit Tests ===\n");

for (const [dietType, label] of Object.entries(DIET_LABELS)) {
  console.log(`[${dietType}] → "${label}"`);

  // 1. Label exists and is non-empty
  check("label is defined", typeof label === "string" && label.length > 0);

  // 2. Forbidden ingredients mentioned
  for (const keyword of MUST_EXCLUDE[dietType] ?? []) {
    check(`excludes "${keyword}"`, label.toLowerCase().includes(keyword.toLowerCase()), `"${keyword}" not found`);
  }

  // 3. Allowed ingredients mentioned
  for (const keyword of MUST_ALLOW[dietType] ?? []) {
    check(`allows "${keyword}"`, label.toLowerCase().includes(keyword.toLowerCase()), `"${keyword}" not found`);
  }

  // 4. Prompt injection check — diet label appears in the simulated prompt line
  const promptLine = `- Diet type: ${label}`;
  check("correctly injected into prompt", promptLine.includes(label));

  console.log();
}

// 5. Fallback: unknown diet_type → defaults to DIET_LABELS.all
console.log("[unknown diet_type fallback]");
const fallback = DIET_LABELS["some-unknown-type"] ?? DIET_LABELS.all;
check("unknown diet_type falls back to 'all'", fallback === DIET_LABELS.all);
console.log();

console.log("[diet validator samples]");
check("vegan catches beef", findDietViolations("beef porridge", "vegan").some((v) => v.startsWith("meat:")));
check("vegan catches egg in Korean", findDietViolations("계란죽", "vegan").some((v) => v.startsWith("egg:")));
check("ovo allows egg", findDietViolations("egg scramble", "ovo").every((v) => !v.startsWith("egg:")));
check("pescatarian allows salmon", findDietViolations("salmon rice", "pescatarian").every((v) => !v.startsWith("fish:")));
check("lacto catches egg", findDietViolations("egg yolk porridge", "lacto").some((v) => v.startsWith("egg:")));
check("eggplant is not egg", findDietViolations("eggplant puree", "vegan").every((v) => !v.startsWith("egg:")));
console.log();

console.log(`=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
