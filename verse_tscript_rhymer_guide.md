Brief Technical Reference and Tips for `verse_tscript_rhymer.ts` usage  

**Purpose:** Rhyme analysis & candidate generation over CMU Pronouncing Dictionary.  
**Dependencies:** `pronouncing` (CommonJS). Type declarations via `pronouncing.d.ts` (in `/node_modules/pronouncing/`)
---
### Core Exports (All Rhyme Types)
| RhymeType | Function (line) | Output behavior |
|-----------|----------------|------------------|
| `perfect` | `perfectRhyme` (L~329) | returns words with identical rhyming part from last stressed vowel |
| `family` | `familyRhyme` (L~349) | matched stressed vowel + coda consonants in same phonetic family |
| `slant` | `slantRhyme` (L~401) | near rhyme; uses `SlantOptions` (stress, consonantTail) |
| `masculine` | `masculineRhyme` (L~423) | perfect rhymes that are `isMasculine` |
| `feminine` | `feminineRhyme` (L~434) | perfect rhymes that are `isFeminine` |
| `dactylic` | `dactylicRhyme` (L~445) | perfect rhymes that are `isDactylic` |
| `eye` | `eyeRhyme` (L~456) | matching last 3/4 graphemes, different rhyming part |
| `rich` | `richRhyme` (L~489) | identical phoneme sequence, different spelling |
| `assonant` | `assonantRhyme` (L~513) | vowels match, consonants wildcarded |
| `consonant` | `consonantRhyme` (L~541) | consonants match, vowels wildcarded |
| `augmented` | `augmentedRhyme` (L~566) | target word’s rhyming part + extra consonant(s) in candidate |
| `diminished` | `diminishedRhyme` (L~586) | candidate’s rhyming part is prefix of target’s (shorter) |
| `syllabic` | `syllabicRhyme` (L~605) | last syllable (vowel + optional consonants) matches |
| `light` | `lightRhyme` (L~623) | matching phoneme sequence but not as last stressed vowel |
| `wrenched` | `wrenchedRhyme` (L~648) | only suffix consonants match; preceding vowel differs |
| `grammatical` | `grammaticalRhyme` (L~683) | same root up to stressed vowel, different ending |
| `trailing` | `trailingRhyme` (L~710) | target’s last stressed syllable appears as first syllable of candidate |
| `apocopated` | `apocopatedRhyme` (L~727) | target’s first stressed syllable appears as last syllable of candidate |
| `unstressed` | `unstressedRhyme` (L~744) | match from last unstressed vowel; candidate’s match not last stressed |
| `mosaic` | `mosaicRhyme` (L~770) | multi‑feature score (vowel, consonant family, stress); `minMatchScore` (0.5 default) |
| `identical` | `identicalRhyme` (L~813) | returns `[word]` |

**Dispatcher:** `getRhymes(word, type, phones?)` (L~817) → string[]  
**Classifier:** `classifyRhyme(wordA, wordB)` (L~846) → RhymeType[]  
**Random pick:** `randomRhyme(word, phones?)` (L~857) → `{word, type}` or null
---
### Phoneme Helpers (for custom exotic rhyme logic)

| Function (line) | Input | Output | Use case |
|----------------|-------|--------|----------|
| `firstPhonesForWord` (L~149) | `word` | phones string (or empty) | get canonical pronunciation |
| `rhymingPart` (L~211) | phones string | substring from last stressed vowel | perfect rhyme core |
| `stressPattern` (L~173) | phones | digits string (e.g., `"102"`) | stress‑scheme matching |
| `syllableCount` (L~179) | phones | number | line‑length validation |
| `lastStressedVowelIndex` (L~196) | phonesList (split) | index or -1 | rhyme part extraction |
| `onsetBefore` (L~223) | phonesList, vowelIndex | string[] of consonants before that vowel | trailing/apocopated checks |
| `codaAfter` (L~232) | phonesList, vowelIndex | string[] of consonants after that vowel | family rhyme consonant matching |
| `isVowel` / `isConsonant` (L~110,119) | phone | boolean | custom wildcard building |
| `vowelBase` (L~124) | vowel phone (e.g., `"AA1"`) | `"AA"` | stress‑ignoring vowel match |
| `isMasculine` / `isFeminine` / `isDactylic` (L~300,307,314) | word, optional phones | boolean | structural filters |

**Low‑level helpers (avoid direct use unless necessary):** - `wildcardMixPhonesRegexSearches` (L~996) – generates 2^n patterns; **do not call inside loops**.  
- `consonantClusters` / `isConsonantCluster` – rarely needed.
---
### Performance Directives (apply proactively)
| Issue | Preventive directive |
|-------|----------------------|
| **Candidate flood** (e.g., `perfectRhyme('be')` → 200+ words) | After calling `getRhymes`, **always** `slice(0, 50)` or apply stress filters (`isMasculine`/`isFeminine`). For `randomRhyme`, internal shuffle+slice is safe. |
| **Slow regex search** | `pronouncing.search` is fast for simple patterns, but **avoid** calling inside a loop over many words. Batch candidates with `Array.filter` after a single search. |
| **`mosaicRhyme` overhead** | Use only when explicitly requested; keep `minMatchScore ≥ 0.6`. For lower scores, result set grows quadratically. |
| **`slantRhyme` wildcard explosion** | Function already bounds `consonantTail` (default 0). Never pass `consonantTail > 2` unless word is very short (≤4 phonemes). |
| **`familyRhyme` coda length mismatch** | Internally compares coda length – safe. Candidates collected via `pronouncing.search` pattern `targetVowel + ' .{1,3}'*k`; may be slow for long codas. Cache results per `(word, type)`. |
| **`eyeRhyme` suffix regex** | Uses `\b(${ending4}|${ending3})$` – fast. No action needed. |
| **`richRhyme` exact phone match** | Uses `pronouncing.search('^' + wList.join(' ') + '$')` – efficient. |
| **`assonantRhyme`/`consonantRhyme` wildcard chain** | Internally builds regex with `.{1,3}` for mismatched phonemes; line length in phonemes rarely exceeds 10, safe. |
| **`trailingRhyme`/`apocopatedRhyme`** | Search `^` or `$` patterns anchored to syllable boundaries – small result sets. |
| **`wrenchedRhyme` suffix search** | `search('.{1,3} ' + suffix + '$')` – suffix is short; safe. |
| **`unstressedRhyme`** | Last unstressed vowel may be far from end; regex is full suffix. No flood. |
| **`lightRhyme`** | Searches words containing target part, then filters. Can be large. **Add a limit:** after `pronouncing.search(targetPart)`, `slice(0, 200)` before filtering. |
| **`grammaticalRhyme`** | Searches `'^' + root` – `root` ends with stressed vowel; safe. |
| **`identicalRhyme`** | Trivial. |

**General caching:** Wrap `getRhymes` with memoization cache keyed by `word + '|' + type + '|' + (phones ?? '')`. CMU dictionary is static.
---
- **Meter‑specific rhyme hints:** Fetch `MeterProfile.rhymeHints` via `getMeterExemplars(meter, foot)`. Inject string into LLM prompt.  
- **Stress‑aware line ending:** For iambic pentameter, prefer masculine rhymes (line 300). Use `isMasculine(word)` as filter. For trochaic, catalexis is natural – not directly handled by rhyme functions, but `isMasculine` works for final stressed syllable.
---
### Example Usage Snippet
```typescript
// Generate candidate rhymes for 'light' with creative variety
import { getRhymes, randomRhyme, isMasculine } from './verse_tscript_rhymer';
const perfects = getRhymes('light', 'perfect').slice(0, 20);
const slants = getRhymes('light', 'slant').slice(0, 20);
const assonants = getRhymes('light', 'assonant').slice(0, 20);
const combined = [...perfects, ...slants, ...assonants];
const unique = [...new Set(combined)];
// Or get a random rhyme from any type
const random = randomRhyme('light');
if (random) console.log(`Use "${random.word}" (${random.type})`);
// Validate a pair
const types = classifyRhyme('night', 'light'); // ['perfect', 'masculine']
```
**Important:** Always slice candidate arrays if presenting to LLM as tool or as routed outputs within a pipeline, to avoid overwhelming context. For `randomRhyme`, no slicing needed.