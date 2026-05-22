# NOUNSING-PRO
#### Morpho-Phonological Toolkit for Poetics, Linguistics, & Prosodic Analysis

**CRUCIAL SETUP INFO**: <br>
1. Clone this repo. <br>
  2. Download the TSV of our augmented CMU Dictionary (*33.2MB*, just over GutHub's *25MB* size limit) from [https://huggingface.co/datasets/AlekseyCalvin/CMU_Augmented/blob/main/newerCMU.tsv](https://huggingface.co/datasets/AlekseyCalvin/CMU_Augmented/blob/main/newerCMU.tsv) <br>
  3. Place it into the cloned root folder. <br>
  4. Build via:
```
npm build
```
  5. Start CLI using:
```
npm start
```
---
**NOUNSING-PRO** is a comprehensive TypeScript toolkit intended as a versatile resource for a broad range of logocentered usage contexts. It may be for used for lexical-phonological-morphological-prosodic analysis, poetry scansion, creative writing, experimental transformation of input texts, and more. It was built over a custom augmented variation of the **CMU Pronouncing Dictionary** (52+ data columns per word) and may be utilized via a programmable API or/and an interactive terminal CLI with ANSI-color-coded diagnostics covering syllable weight, stress contours, metrical parsing, rhyme profiling, morphological classification, onset/coda geometry, vowel quality analysis, Penn Treebank-derived Part-of-Speech tags, Zipf word frequencies (averaged from across SUBTLEX and large web corpuses), and much more.

This toolkit, designed & devised by **[Aleksey Calvin Tsukanov](https://huggingface.co/AlekseyCalvin)** on the behalf of **[SilverAgePoets.com](https://silveragepoets.com/)**, builds on the works of **[Allison Parrish](https://www.decontextualize.com/)**, UCLA's **[Claire Moore Cantwell](https://clairemoorecantwell.org/)**, **[Bruce Hayes](https://brucehayes.org/)**, and  **[Austin Pursley](https://austinpursley.com/)** (more detailed credits at the bottom).

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
   - [Node.js / npm](#nodejs--npm)
   - [Browser (Browserified Build)](#browser-browserified-build)
   - [Launching the CLI](#launching-the-cli)
2. [The CLI: A Guided Tour](#the-cli-a-guided-tour)
   - [Main Menu](#main-menu)
   - [Submenu 1: Analyze a Single Word in Depth](#submenu-1-analyze-a-single-word-in-depth)
     - [A. Quick Summary](#a-quick-summary)
     - [B. Deep Scansion & Meter](#b-deep-scansion--meter)
     - [C. Rime, Coda & Rhyme Profile](#c-rime-coda--rhyme-profile)
     - [D. Morphology & Extrametricals](#d-morphology--extrametricals)
     - [E. Vowel Qualities](#e-vowel-qualities)
     - [F. Onset Structure Analysis](#f-onset-structure-analysis)
     - [G. Granular Rime Weights](#g-granular-rime-weights)
   - [Submenu 2: Search Dictionary](#submenu-2-search-dictionary)
     - [A. Basic Rhyme Search](#a-basic-rhyme-search)
     - [B. Pattern Search](#b-pattern-search)
     - [C. Meter Search](#c-meter-search)
     - [D. RegEx Search](#d-regex-search)
     - [E. Most Common Sounds](#e-most-common-sounds)
   - [Submenu 3: Process a Phrase / Line / Text](#submenu-3-process-a-phrase--line--text)
     - [A. Syllable & Phoneme Counter](#a-syllable--phoneme-counter)
     - [B. Rewrite Text from Phonemes](#b-rewrite-text-from-phonemes)
     - [C. Stress Pattern Rewrite](#c-stress-pattern-rewrite)
     - [D. Rhyme Rewrite](#d-rhyme-rewrite)
     - [PoS Precision & Zipf Threshold](#pos-precision--zipf-threshold)
   - [Submenu 4: Nuanced Rhyming](#submenu-4-nuanced-rhyming)
   - [Submenu 5: Advanced Rhyming](#submenu-5-advanced-rhyming)
3. [API Reference](#api-reference)
   - [Core Pronouncing-Derived Functions](#core-pronouncing-derived-functions)
   - [Domain-Segmented Data Accessors](#domain-segmented-data-accessors)
   - [Complex NLP & Poetics Functions](#complex-nlp--poetics-functions)
   - [Text-Processing Functions](#text-processing-functions)
   - [Deep Rhyme & Metrical Generation](#deep-rhyme--metrical-generation)
   - [Supported Rhyme Types](#supported-rhyme-types)
   - [Type Exports](#type-exports)
4. [Tutorial: API Examples](#tutorial-api-examples)
   - [Word Pronunciation & Syllable Counting](#word-pronunciation--syllable-counting)
   - [Calculating Most Common Sounds](#calculating-most-common-sounds)
   - [Pronunciation & Meter Search](#pronunciation--meter-search)
   - [Rhyme Search & Rhyme-Based Rewriting](#rhyme-search--rhyme-based-rewriting)
   - [Deep & Nuanced Rhyme Search](#deep--nuanced-rhyme-search)
   - [Stress Pattern Rewrite](#stress-pattern-rewrite)
   - [Phoneme-Based Rewrite](#phoneme-based-rewrite)
   - [Scanning with Poetic Fit & Metrical Insets](#scanning-with-poetic-fit--metrical-insets)
   - [Phrase-Level Syllable & Phoneme Counting](#phrase-level-syllable--phoneme-counting)
5. [The Augmented CMU Dictionary](#the-augmented-cmu-dictionary)
   - [Full Column Listing](#full-column-listing)
   - [Sample Data Row](#sample-data-row)
   - [Column Definitions](#column-definitions)
6. [Penn Treebank Part-of-Speech Tags](#penn-treebank-part-of-speech-tags)
7. [Expert Glossary](#expert-glossary)
8. [Technical Information](#technical-information)
   - [Build Pipeline](#build-pipeline)
   - [Package Files](#package-files)
   - [Configuration](#configuration)
9. [Credits & Attribution](#credits--attribution)

---

## Installation & Setup

### Node.js / npm

Install from npm:

```bash
npm install nounsing-pro
```

The dictionary data (a ~31MB augmented TSV) is loaded automatically when the module is first imported.

**TypeScript / ESM:**

```typescript
import * as nounsing from 'nounsing-pro';
```

**CommonJS:**

```javascript
const nounsing = require('nounsing-pro');
```

### Browser (Browserified Build)

A self-contained browser bundle is available at `dist/nounsing-browser.js`. It includes the full dictionary inlined and exposes `window.nounsing` globally.

1. Copy `dist/nounsing-browser.js` to your web project.
2. Include it with a `<script>` tag:

```html
<script src="nounsing-browser.js"></script>
<script>
  const n = window.nounsing;
  console.log(n.phonesForWord("hello"));
  console.log(n.scansion("abacus"));
  console.log(n.vowelQualities("watermark"));
</script>
```

### Launching the CLI

After installation:

```bash
npm start
```

Or directly:

```bash
node dist/cjs/cli.js
```

Type `exit` or `quit` at any prompt to leave.

---

## The CLI: A Guided Tour

The CLI uses arrow-key-selectable menus (powered by `prompts`) and ANSI color-coding (via `chalk`). Every menu path supports typing `exit` or `quit` to return to the shell.

### Main Menu

Three paths are offered:

```
1. Analyze a Single Word in Depth
2. Search Dictionary
3. Process a Phrase / Line / Text
```

### Submenu 1: Analyze a Single Word in Depth

After entering a word, you choose from 9 analysis modes:

#### A. Quick Summary

Displays spelling, syllable count, Part-of-Speech tag, Zipf frequency, vowel length category, full ARPAbet phones, CV syllabic structure, and syllabification with parenthetical boundaries.

Example for **abacus**:

```
Spelling:       abacus
Syllables:      3
Part of Speech: NN
Zipf Frequency: 4.25
Vowel Length:   shortV
Phones:         AE1 B AH0 K AH0 S
CV Structure:   L.CL.CLC
Syllabified:    (AE)(b AH)(k AH s)
```

#### B. Deep Scansion & Meter

The most detailed metrical analysis. Displays:

- **Stress Contour** — the digit-string of the word's stress pattern (e.g., `100` for dactylic words)
- **Scansion Label** — traditional poetic foot classification (16 types supported)
- **Weight Pattern** — H/L heaviness pattern for the last 3 syllables, color-coded (red = H, cyan = L)
- **Stress Details** — main stress location, left-edge stress index, initial stress, single-stress flag, final-3 stress transcription
- **Holistic Metered Fit** — which of the 16 foot types the *entire* word matches
- **Inset Metrical Feet** — all detectable foot patterns *within* the word's syllabic sub-windows, color-coded by stress:
  - <span style="color:red">Red</span> = primary-stressed syllables
  - <span style="color:magenta">Magenta</span> = secondary-stressed syllables
  - <span style="color:#DAA520">Yellow</span> = unstressed syllables

Example for **watermark** (contour `102`):

```
DEEP SCANSION & METER
Stress Contour:    102
Scansion Label:    dactylic
Weight Pattern:    L L H

HOLISTIC METERED FIT
  Dactyl

INSET METRICAL FEET
Iamb           (t ER)(m AA r k)
Trochee        (w AO)(t ER)
Dactyl         (w AO)(t ER)(m AA r k)
Cretic         (w AO)(t ER)(m AA r k)
```

The 16 supported foot types: Iamb (01), Trochee (10), Spondee (11), Pyrrhic (00), Dactyl (100), Anapest (001), Amphibrach (010), Bacchic (011), Antibacchic (110), Cretic (101), Choriamb (1001), Antispast (0110), First Paeon (1000), Second Paeon (0100), Third Paeon (0010), Fourth Paeon (0001).

Holistic meter fit checks whether the *entire* word matches a single foot pattern. Inset metrical feet slide a window across the contour to find every sub-sequence matching any foot — revealing the internal metrical architecture of the word.

#### C. Rime, Coda & Rhyme Profile

Displays the rhyming portion of the word's phones, rime heaviness (H/L), extrametrical-S status, coda geometry (open/Singleton/Cluster), coda phoneme count, final coda class, penult possible-coda status, and final complex onset flag.

Example for **abacus**:

```
RIME, CODA & RHYME PROFILE
Rhyming Phones:      AH0 K AH0 S
Rime Heaviness:      L (Light)
Extrametrical S:     Detected (S/SCluster)
Coda Geometry:       Singleton
Coda Phonemes:       S (Length: 1)
Final Coda:          Singleton
Penult Possible Coda: noCoda
Final Complex Onset: simple
```

#### D. Morphology & Extrametricals

Displays morphological structure (simple vs. complex), prefix/suffix presence and type, stress-shift likelihood (based on penult heaviness), and extrametrical-S classification with the exact classifier from the dataset (S, SCluster, otherSingleton, otherCluster).

The **S classifier** distinguishes morphological/sibilant word-final segments (like plural `/s/` or `/z/`) that often behave as extrametrical — dodging standard stress-weight rules in English phonology.

#### E. Vowel Qualities

Counts monophthongs (M) vs. diphthongs (D) across the word's final, penult, and antepenult nuclei. Indicates whether the word is purely monophthongal. Also displays the final vowel in ARPAbet and its two-way classification (-i, -ah, other).

#### F. Onset Structure Analysis

Displays the onset complexity for each syllable position using CV notation:
- `0` = null onset (vowel-initial syllable)
- `C` = singleton consonant
- `CC` = consonant cluster of 2
- `CCC` = complex onset of 3 consonants

Also shows the full CV syllabic structure and syllabification, final coda geometry, final complex onset status, and penult closure status (from Maximal Onset Principle analysis).

#### G. Granular Rime Weights

Shows the full rime structure for each syllable position using the dataset's weight notation:
- `-V` = short/lax vowel, open syllable
- `-VV` = long/tense vowel, open syllable
- `-LC` = short vowel + single consonant coda
- `-LCC` = short vowel + consonant cluster coda
- `-TCC` = long vowel + consonant cluster coda

Also displays heaviness (L/H) and the H/L pattern for the last 3 syllables, plus the final rime weight and phones.

### Submenu 2: Search Dictionary

#### A. Basic Rhyme Search

(**NOTE:** *This rhyme-matching pipeline only supports perfect rhymes. Use the nuanced/advanced rhyme matching functions (detailed below) to search for slant, eye, rich, trailing, consonant, and many other varieties of rhymes and homophonies.*) Enter a target word. The tool extracts its rhyming part (from the last stressed vowel onward) and searches the dictionary for all words ending with that same phonetic sequence. For results > 23, a flexible slice prompt appears supporting:
- `all` — show everything
- `300` — first 300
- `300-600` — range from result 300 to 600
- `s` — only words starting with "s"
- `s 100` — up to 100 words starting with "s"

#### B. Pattern Search

Enter a text pattern (e.g., `arb`). Choose whether to match the start of words only or anywhere. Optionally filter by poetic meter (any of the 16 foot types). Results are intersection-filtered: a word must match both the text pattern AND the meter constraint.

#### C. Meter Search

Enter a stress pattern regex (e.g., `001$` for anapests, `^10` for trochees, `100100` for two dactyls). The tool searches all words whose stress digit-string matches the regex.

#### D. RegEx Search

Enter a phonetic regex pattern (e.g., `^S K L` for words starting with those phones, or `\bIH.*IH\b` for words containing IH twice). Searches the full ARPAbet phone strings.

#### E. Most Common Sounds

Enter any phrase or paragraph. The tool tallies all phonemes across recognized words and displays the top 13 most frequent phones with:
- A frequency bar
- Numbered attributions showing each word that contributed the phone, with the focal phone highlighted in red and the rest of the phones in white, and the word in purple

### Submenu 3: Process a Phrase / Line / Text

Enter any phrase, line, sentence, or paragraph. Then choose from 4 operations:

#### A. Syllable & Phoneme Counter

Displays word count, total syllables, total phonemes, and per-word averages. Below the count, two colored displays appear:

- **PHONETIC TRANSCRIPTION** — the full phrase in ARPAbet, with stress-colored vowels (red = 1, magenta = 2, yellow = 0) and purple consonants. Words separated by gray underscores.
- **SYLLABIFIED PHRASE** — the full phrase as syllabified groups in light blue, with gray word separators.

#### B. Rewrite Text from Phonemes

Each word is replaced by a random dictionary word sharing its first two ARPAbet phones. Useful for generating phonetically-resonant text variations.

#### C. Stress Pattern Rewrite

Each word is replaced by a random dictionary word with the exact same stress pattern. This preserves the metrical skeleton of the input while utterly transforming its semantics.

#### D. Rhyme Rewrite

Each word is replaced by a random rhyming word from the dictionary. Words without rhymes are preserved as-is.

#### PoS Precision & Zipf Threshold

For operations B, C, and D, two optional filters are offered:

**Part-of-Speech (PoS) Precision** (0–3):
- `3` — Exact Penn Treebank tag match (e.g., VBN only matches VBN)
- `2` — First 2 characters of tag must match (e.g., VBN matches VB, VBD, VBG, VBP, VBZ)
- `1` — First character of tag must match (e.g., VBN matches all V* tags)
- `0` — Disabled (no PoS filtering)

**Lexicon Normativity (Zipf) Threshold** (0–4.00, default 2.00):
- Values ≥ 1.00 — Only candidate words with Zipf frequency ≥ the threshold are eligible. Words with `NA` frequency are excluded.
- Values < 1.00 — Filter is disabled; all candidates (including NA-frequency words) are eligible.
- Accepts two decimal places (e.g., 2.62).

These combine flexibly: you can use PoS filtering with or without a Zipf threshold, and vice versa.

#### Submenu 4: Nuanced Rhyming

Allows for deep, targeted exploration of the database using **21 distinct rhyming categories** compiled in `src/verse_tscript_rhymer.ts`. Candidates are generated directly from the entire lexicon without arbitrary limits on candidate lists.

- **Grid Matrix Selector**: An interactive 4x5 arrow-key-selectable terminal grid containing the full range of supported rhyme types. Easily navigate using arrow keys (`Up`/`Down`/`Left`/`Right`), select with `Enter`, or exit to the main menu with `Esc` or `q`.
- **Pure Rhyming Scope**: All advanced filters (Part-of-Speech, Zipf, stress, meter, etc.) are disabled. It focuses purely on retrieving matches that acoustically satisfy the selected rhyming category's rules.
- **Slicing Control**: If the count of matching rhymes exceeds 23, the tool prompts you to select a slice range (e.g. `all`, `300`, `300-600`, or a prefix search filter like `s 100`) to paginate through results.

#### Submenu 5: Advanced Rhyming

The ultimate rhyming tool combining deep acoustic rhyming with complex structural and metrical queries.

- **Dynamic Rhyme Type Selector**: Renders the same convenient 4x5 console matrix selector to let you choose the precise rhyming category.
- **Linguistic, Lexical & Poetic Constraints**: After choosing the target word and the rhyming category, the CLI prompts for:
  - **Part-of-Speech (PoS) Precision** (0–3): Standard Penn Treebank tag filtering (Exact, Broad, or Category match).
  - **Lexicon Normativity (Zipf) Threshold** (0–4.00, default 2.00): Restrict results to a frequency floor.
  - **Exact Syllable Count**: Filters rhymes strictly to a specified length.
  - **Holistic Poetic Foot Fit (Meter)**: Select from 16 traditional foot structures (e.g. `iamb`, `trochee`, `dactyl`) to guarantee candidates match the metric across their entire word contour.
  - **Exact Stress Contour Pattern**: Restrict candidates to a precise stress contour pattern (e.g. `10` or `010`).
- **Interactive Slicing & Export**: Paginate or filter the final metrically aligned results using the slice range commands.

---

## API Reference

### Core Pronouncing-Derived Functions

These functions are adapted from Allison Parrish's Pronouncing library and maintain backward-compatible behavior.

| Function | Signature | Returns | Description |
|---|---|---|---|
| `parseCMU(str)` | `(str: string)` | `Pronunciation[]` | Parses 54-column TSV string into pronunciations and WordProfiles |
| `syllableCount(phones)` | `(phones: string \| string[])` | `number` | Counts vowel nuclei (syllables) in a phone string |
| `phonesForWord(word)` | `(word: string)` | `string[]` | Returns all ARPAbet pronunciations for a word |
| `rhymingPart(phones)` | `(phones: string)` | `string` | Extracts the rhyme portion from the last stressed vowel onward |
| `search(pattern)` | `(pattern: string \| RegExp)` | `string[]` | Finds words whose phones match a regex pattern |
| `searchStresses(pattern)` | `(pattern: string)` | `string[]` | Finds words whose stress digit-string matches a regex pattern |
| `rhymes(word)` | `(word: string)` | `string[]` | Returns all words that perfectly rhyme with the given word, per the phonemes which constitute its rhyming part  |
| `stresses(s)` | `(s: string)` | `string` | Extracts stress digits (0/1/2) from a phone string |

### Domain-Segmented Data Accessors

These functions return structured data from the augmented CMU columns detailing and/or mapping fine-grained morphological or/and phonological features for each word.

| Function | Returns | Covers |
|---|---|---|
| `lexicon(word)` | `{spelling, freq, pos, nsylls}[] \| null` | Lexical metadata |
| `phonemics(word)` | `{phones, syllStruct, syllabification, vowelLength}[] \| null` | Phonemic representation |
| `stress(word)` | `StressData[] \| null` | Full stress contour and positional stress mapping |
| `weights(word)` | `{pattern, details}[] \| null` | Syllabic weight topology (H/L pattern + per-syllable onsets/vowels/codas) |
| `vowels(word)` | `{finalV, finalTwoV, types}[] \| null` | Vowel identities and D/M classification per nucleus |
| `edges(word)` | `{finalC, finalComplexOnset, codaLength, penultPossibleCoda, coda}[] \| null` | Onset/coda boundary geometry |
| `morphology(word)` | `{morphology, suffixType, prefixType, prefix, suffix, extrametricalS}[] \| null` | Morphological structure and affix dynamics |
| `all(word)` | `WordProfile[] \| null` | All 52+ columns combined (the "god object") |

### Complex NLP & Poetics Functions

| Function | Signature | Returns | Description |
|---|---|---|---|
| `rhymeProfile(word)` | `(word: string)` | `{rhymingPhones, weight, hasExtrametricalS, codaComplexity}[] \| null` | Rhyming phones, rime heaviness, extrametrical detection |
| `rhymeBySyllables(word, count)` | `(word: string, count: number)` | `string[]` | Rhymes filtered by syllable count |
| `meterMatch(pattern)` | `(pattern: string)` | `string[]` | Words matching exact metrical sequence |
| `scansion(word)` | `(word: string)` | `{contour, label, weightPattern}[] \| null` | Poetic scansion label from stress contour |
| `onsetParse(word)` | `(word: string)` | `{syllabification, cvStructure, isPenultClosed}[] \| null` | Maximal Onset Principle analysis |
| `suffixShiftPotential(word)` | `(word: string)` | `{currentSuffix, suffixType, shiftLikely}[] \| null` | Suffix stress-shift likelihood |
| `extrametricals(word)` | `(word: string)` | `{S_classifier, codaLength, finalComplexOnset, isIrregular, status}[] \| null` | Extrametrical-S edge classification |
| `vowelQualities(word)` | `(word: string)` | `{distribution, diphthongs, monophthongs, allMonophthong}[] \| null` | Diphthong vs. monophthong statistics |
| `codaComplexity(word)` | `(word: string)` | `{complexity, codaLength, phonemes, isComplex}[] \| null` | Final coda complexity analysis |
| `poeticFit(word, footType)` | `(word: string, footType: PoeticMeter)` | `boolean` | Whether word matches a holistic poetic foot |
| `metricalInsets(word)` | `(word: string)` | `Record<string, MetricalInset[][]> \| null` | All inset metrical feet with per-syllable stress info |

### Text-Processing Functions

| Function | Signature | Returns | Description |
|---|---|---|---|
| `mostCommonPhones(text, topN?)` | `(text: string, topN?: number)` | `[string, number][]` | Top N most frequent phones in a text (default 5) |
| `countTextSyllables(text)` | `(text: string)` | `{syllables: number, phonemes: number}` | Total syllables and phonemes in text |
| `rewriteFromFirstTwoPhones(text, posPrecision?, freqThreshold?)` | `(...) => string` | `string` | Replace each word with one sharing its first two phones |
| `rewriteWithStressPattern(text, posPrecision?, freqThreshold?)` | `(...) => string` | `string` | Replace each word with one sharing its stress pattern |
| `rewriteWithRhymes(text, posPrecision?, freqThreshold?)` | `(...) => string` | `string` | Replace each word with a rhyming word |

All three rewrite functions accept optional `posPrecision` (0–3) and `freqThreshold` (0–4.00) parameters for filtering candidates by Part-of-Speech and Zipf frequency.

### Deep Rhyme & Metrical Generation

These functions are located in the `src/verse_tscript_rhymer.ts` module and provide programmatic access to our nuanced/advanced rhyming engine:

| Function | Signature | Returns | Description |
|---|---|---|---|
| `getRhymes(word, type, options?)` | `(word: string, type: RhymeType, options?: GetRhymesOptions \| string)` | `string[]` | Returns all matching rhyme candidates of a given type. Supports advanced metrical/POS filtering options. |
| `classifyRhyme(wordA, wordB, options?)` | `(wordA: string, wordB: string, options?: { includeMosaic?: boolean })` | `RhymeType[]` | Identifies and returns all rhyme relations holding between two words. |
| `randomRhyme(word, options?)` | `(word: string, options?: GetRhymesOptions)` | `{ word: string; type: RhymeType } \| null` | Shuffles all candidates across multiple categories and selects a single random rhyme. |
| `isMasculine(word, phones?)` | `(word: string, phones?: string)` | `boolean` | Checks if a word is structurally masculine (primary stress on the final syllable). |
| `isFeminine(word, phones?)` | `(word: string, phones?: string)` | `boolean` | Checks if a word is structurally feminine (primary stress on the penultimate syllable). |
| `isDactylic(word, phones?)` | `(word: string, phones?: string)` | `boolean` | Checks if a word is structurally dactylic (primary stress on the antepenultimate syllable). |

### Supported Rhyme Types

The toolkit features a rich taxonomy of **20+ programmatic rhyme types** implemented within `src/verse_tscript_rhymer.ts`. These represent a synthesis of tactical phoneme-matching, other specialized searches, and algorithmic/heuristic implementations of various organic poetic principles and patterns:

| Rhyme Type | Synthesized Phonetic Rules & Description | Exemplar Pairs |
|---|---|---|
| `perfect` | **True Perfect Rhyme**: Exactly matched last-stressed syllable phonemes (not always or necessarily grapheme); the number of unstressed syllables preceding the last stressed syllable is immaterial for whether or not words rhyme. | *beat/street/incomplete/eat/elite/receipt*, *June/moon* |
| `family` | **Consonant Family Rhyme**: When the stressed vowels match exactly, while the final consonant sounds belong to the same phonetic family. Per CMU acoustic formulations, the consonant sounds must both be plosives ((voiced:) *B, D, G*, (unvoiced:) *P, T, K*), or both fricatives ((voiced:) *V, TH, Z, ZH, JH*, (unvoiced:) *F, TH, S, SH, CH*), or both nasals (*M, N, NG*). | *wet/deck*, *dame/grain*, *float/yoke*, *math/pass* |
| `slant` | **Near / Slant Rhyme**: Close but imperfect rhyme, typically matching the final consonants (coda frame) while vowels vary slightly; also called near-rhyme. | *prayer/despair*, *air/cigar* |
| `masculine` | **Single / Masculine Rhyme**: Also known as a single rhyme, wherein the rhyming primary stress falls entirely on the final syllable of the end-word/foot. | *out/doubt*, *sing/ring* |
| `feminine` | **Double / Feminine Rhyme**: Also known as a double rhyme, with the rhyming primary stress falling on the penultimate (second-to-last) syllable of the end-word or sequence (can sometimes be simultaneously compound: composed of multiple matching syllables, even across word boundaries). | *picky/tricky*, *yellow/fellow* |
| `dactylic` | **Triple / Dactylic Rhyme**: Rhyme with its stress on the antepenultimate (third-to-last) syllable of the end-word or sequence (can sometimes be simultaneously compound: composed of multiple matching syllables, even across word boundaries). | *mortality/finality*, *amorous/glamorous* |
| `eye` | **Visual / Eye Rhyme**: Visual similarity of spelling or graphemes without a corresponding sonic, acoustic, or phonetic match. | *prove/love*, *laughter/slaughter* |
| `rich` | **Homophonic / Rich Rhyme**: Rhyme between homophones or near-homophones (identical phonetic sound strings) with utterly distinct spelling and meanings; the direct opposite of an eye rhyme. | *belief/leaf*, *right/write*, *night/knight* |
| `assonant` | **Vowel-Only / Assonant Rhyme**: Only the vowel sounds match (in stressed and optionally unstressed syllables), while surrounding consonant graphemes and/or phone frames may be completely different. | *eyes/paradise*, *fade/lake* |
| `consonant` | **Para-Rhyme / Consonant Rhyme**: Also known as a para-rhyme, where only the consonant frame/graphemes match, but the vowel sounds/phones and/or graphemes are different. | *heal/hell*, *bell/bull*, *rider/rudder* |
| `augmented` | **Extended / Augmented Rhyme**: A sort of extension of slant rhyme. A rhyme in which the rhyming word (the latter word of a rhyming pair) carries an additional terminal consonant sound. | *bray/brave*, *grow/sown*, *play/plate* |
| `diminished` | **Subtractive / Diminished Rhyme**: Reversal of the augmented rhyme. A slant near-rhyme variant in which the rhymed-with word (the preceding word within a rhyming pair) carries an additional terminal consonant sound compared to the candidate. | *brave/day*, *blown/sow*, *stained/rain* |
| `syllabic` | **Syllabic Rhyme**: A rhyme in which the last syllable of each word sounds phonetically identical but does not necessarily contain stressed vowels. | *cleaver/silver*, *bottle/fiddle* |
| `light` | **Unbalanced / Light Rhyme**: Rhymes a primary or normatively stressed syllable with a secondarily stressed or unstressed syllable of another word, disrupting conventional metrical stress patterning. | *nets/carpéts*, *he/poverty*, *stem/stratagem* |
| `wrenched` | **Morphological / Wrenched Suffix Rhyme**: Rhyme based and grounded solely in matched morphological suffixes, without any corresponding or preceding stressed vowel homophonies; yet, the parallelism of suffixed morphologies may often harness sufficient anchoring to offset acoustic dissonance. | *manifestation/attraction/convention* |
| `grammatical` | **Grammatical Rhyme**: Rhyme between words sharing a matching stressed vowel sound at their roots, but carrying distinct inflectional suffixes or endings, often enforced by the rules and constraints of grammatical well-formedness in English. | *pun/running/funny* |
| `broken` | **Enjambment-Split / Broken Rhyme**: A conceptual rhyme finder intended to spot instances where a word is physically split across line breaks (enjambment) to rhyme one fragment with the end-word/syllables of another line, cutting words apart so the first part rhymes with some other line. Intended to be leveraged within fully-featured scansion engines equipped with syntactically/grammatically informed modules and, thereby, capable of reliably parsing and resolving features, dependencies, and constraints across multiline or stanzaic inputs. In and of itself, Nounsing-Pro is scarcely equipped for such usages but is designed to support them in combination with other NLP tools. Examples of so-called broken rhymes: | *... LIGHT / ... NIGHT-[-gown]*, *Some asleep unawakened, ALL un- / -warned, eleven fathoms FALLen* |
| `trailing` | **Leading‑Target / Trailing Rhyme**: Where the rhyming part (the target of a rhyme) matches the first syllable of a two-syllable word (or the first word in a pair of monosyllabic words). | *ring/finger*, *scout/doubter* |
| `apocopated` | **Leading‑Source / Apocopated Rhyme**: Where the rhymed-with part (the source component of a rhyme pair) is the first syllable of a two-syllable word (or the first word in a monosyllabic word pair); the exact reversal of the trailing rhyme. | *finger/ring*, *doubter/scout* |
| `unstressed` | **Weak-Syllable / Unstressed Rhyme**: Rhymes which fall entirely on matched unstressed syllables, leaving the stressed syllables completely distinct. | *forgiven/hidden*, *prison/heaven*, *very/sorry* |
| `mosaic` | **Compound / Mosaic Rhyme**: Complex compound rhymes aligning cumulative matching or near-matching of several features: homophonies (matching vowel phones), consonant family-matches (like family rhymes), and scansion (stress patterns) across syllabic sequences, phrases, or entire sub-phrases. | *astronomical/solemn and comical*, *when you say/there you stay/blew away* |
| `identical` | **Refrain / Identical Rhyme**: Rhyme by exact duplication of the same word. Frequently utilized in forms like Villanelles, Madrigals, or complex refrains. | *I froze, profoundly shaken / indeed, the doll had shaken* |

### Type Exports

```typescript
export type RhymeType =
  | 'perfect' | 'family' | 'slant' | 'masculine' | 'feminine' | 'dactylic'
  | 'eye' | 'rich' | 'assonant' | 'consonant' | 'augmented' | 'diminished'
  | 'syllabic' | 'light' | 'wrenched' | 'grammatical' | 'trailing'
  | 'apocopated' | 'unstressed' | 'mosaic' | 'identical';

export interface GetRhymesOptions {
  phones?: string;
  posPrecision?: number;     // Part-of-Speech precision (0-3)
  freqThreshold?: number;    // Zipf frequency threshold (e.g. 2.0)
  syllables?: number;        // Exact syllable count filter
  poeticFit?: PoeticMeter;   // Poetic foot fit filter (meter)
  stressPattern?: string;    // Exact stress pattern filter (e.g., '10')
}

export type PoeticMeter = 'iamb' | 'trochee' | 'spondee' | 'pyrrhic' |
  'dactyl' | 'anapest' | 'amphibrach' | 'bacchic' | 'antibacchic' | 'cretic' |
  'choriamb' | 'antispast' | 'first paeon' | 'second paeon' | 'third paeon' | 'fourth paeon';

export type MetricalInset = { syll: string; stress: string };

export interface WordProfile { ... }     // Full 52+ column word profile
export interface WeightMetrics { ... }   // Per-syllable weight topology
export interface PhonologyData { ... }   // Phones, syllStruct, syllabification
export interface StressData { ... }      // Stress contour and positional mapping
export interface MorphologyData { ... }  // Morphological structure
```

---

## Tutorial: API Examples

### Word Pronunciation & Syllable Counting

```javascript
const n = require('nounsing-pro');

// Get pronunciations
n.phonesForWord("permit");
// ['P ER0 M IH1 T', 'P ER1 M IH2 T']

// Count syllables
n.syllableCount(n.phonesForWord("programming")[0]);
// 3

// Extract stress pattern
n.stresses(n.phonesForWord("snappiest")[0]);
// '102'

// Get rhyming part
n.rhymingPart('S L IY1 P ER0');
// 'IY1 P ER0'
```

### Calculating Most Common Sounds

```javascript
const top = n.mostCommonPhones(
  "april is the cruelest month breeding lilacs out of the dead",
  5
);
// [['AH0', 4], ['L', 4], ['D', 3], ['R', 3], ['DH', 2]]
```

### Pronunciation & Meter Search

```javascript
// Find words starting with "S K R AE1"
n.search("^S K R AE1").slice(0, 5);
// ['scrabble', 'scragg', 'scraggle', 'scram', 'scramble']

// Find anapestic words (001 at end)
n.searchStresses("001$").slice(0, 3);
// ['abidjan', 'adoree', 'adorees']

// Find two consecutive dactyls
n.searchStresses("100100");
// ['afroamerican', 'afroamericans', 'interrelationship', 'overcapacity']

// Find words with two anapests
n.searchStresses("^00[12]00[12]$");
// ['neopositivist', 'undercapitalize', 'undercapitalized']
```

### Rhyme Search & Rhyme-Based Rewriting

```javascript
// Find rhymes
n.rhymes("failings");
// ['mailings', 'railings', 'tailings']

n.rhymes("sinking");
// ['blinking', 'drinking', 'linking', 'plinking', ...]

// Check if two words rhyme
n.rhymes("cheese").includes("wheeze"); // true
n.rhymes("cheese").includes("geese");  // false

// Rewrite text by rhymes
n.rewriteWithRhymes(
  "april is the cruelest month breeding lilacs out of the dead"
);
// Example: "april wiles's duh coolest month ceding pontiac's krout what've worthey wehde"
```

### Deep & Nuanced Rhyme Search

Use the `src/verse_tscript_rhymer.ts` API to perform complex, multi-layered rhyming queries and word-pair classification:

```javascript
const rhymer = require('nounsing-pro');

// Retrieve family rhymes (matching vowel + same consonant family)
const fams = rhymer.getRhymes("wet", "family");
// ['beck', 'debt', 'get', 'net', 'pet', 'set', 'sweat', ...]

// Retrieve slant rhymes with custom constraints
const slants = rhymer.getRhymes("prayer", "slant");
// ['despair', 'cigar', 'air', 'hair', 'wear', ...]

// Advanced filtering: Perfect rhymes for "sing" restricted to Nouns (NN) with Zipf frequency >= 3.0
const advancedPerfects = rhymer.getRhymes("sing", "perfect", {
  posPrecision: 3,     // Exact Penn Treebank POS tag (e.g., NN only)
  freqThreshold: 3.0   // Common words only
});
// ['ring', 'spring', 'wing', 'string', ...]

// Metrical filtering: Trochaic slant rhymes for "sinking"
const trochaicSlants = rhymer.getRhymes("sinking", "slant", {
  poeticFit: "trochee"
});

// Classify the rhyme relation between two words
rhymer.classifyRhyme("night", "light");
// ['perfect', 'masculine']

rhymer.classifyRhyme("dame", "grain");
// ['family']
```
### Stress Pattern Rewrite

```javascript
n.rewriteWithStressPattern(
  "april is the cruelest month breeding lilacs out of the dead"
);
// Example: "joneses kopf whats rathbun p's gavan midpoint nill goh the pont's"
```

### Phoneme-Based Rewrite

```javascript
n.rewriteFromFirstTwoPhones(
  "april is the cruelest month breeding lilacs out of the dead"
);
// Example: "apec's isn't them kraatz muffy bronte leichliter outpacing of than delfs"
```

**With PoS filtering and Zipf threshold:**

```javascript
// Exact POS match + only common words (Zipf ≥ 3.0)
n.rewriteWithRhymes(
  "the quick brown fox jumps over the lazy dog",
  3,   // PoS precision: exact Penn tag
  3.0  // Zipf threshold: only words with freq ≥ 3.0
);

// Medium POS match + no Zipf filter
n.rewriteFromFirstTwoPhones(
  "the quick brown fox jumps over the lazy dog",
  2,   // PoS precision: first 2 chars of tag
  0    // Zipf disabled
);
```

### Scanning with Poetic Fit & Metrical Insets

```javascript
// Check holistic meter match
n.poeticFit("abacus", "dactyl");     // true  (contour 100)
n.poeticFit("abacus", "iamb");       // false
n.poeticFit("watermark", "cretic");  // true  (contour 102)

// Get full scansion
n.scansion("abacus");
// [{ contour: '100', label: 'dactylic', weightPattern: '100' }]

n.scansion("considerable");
// [{ contour: '01000', label: 'complex/irregular', weightPattern: '0' }]

// Get inset metrical feet
const insets = n.metricalInsets("watermark");
// {
//   iamb: [[{syll:'(t ER)',stress:'0'},{syll:'(m AA r k)',stress:'2'}]],
//   trochee: [[{syll:'(w AO)',stress:'1'},{syll:'(t ER)',stress:'0'}]],
//   dactyl: [[{syll:'(w AO)',stress:'1'},{syll:'(t ER)',stress:'0'},{syll:'(m AA r k)',stress:'2'}]],
//   cretic: [[{syll:'(w AO)',stress:'1'},{syll:'(t ER)',stress:'0'},{syll:'(m AA r k)',stress:'2'}]]
// }
```

### Phrase-Level Syllable & Phoneme Counting

```javascript
const result = n.countTextSyllables("april is the cruelest month");
// { syllables: 8, phonemes: 28 }
```

---

## The Augmented CMU Dictionary

NOUNSING-PRO uses an extensively augmented version of the CMU Pronouncing Dictionary. Where the original CMU maps orthography to ARPAbet phonemes, our augmented TSV adds roughly 50 additional columns of phonological, prosodic, morphological, and corpus-linguistic data per word.

### Full Column Listing

```
spelling  phones  stressTrans  syllStruct  syllabification  mainStress  finalStress
penultStress  apStress  papStress  finalWeight  finalHLweight  penultWeight
penultHLweight  antepenultWeight  antepenultHLweight  preantepenultWeight
preantepenultHLweight  vowelLength  finalOnset  penultOnset  antepenultOnset
finalV  finalC  S  morphology  suffixType  prefixType  Prefix  Suffix  coda
codaLength  freq  POS  nsylls  leftEdgeStress  initStress  singleStress
penultVowel  penultCoda  penultPossibleCoda  finalComplexOnset  penultHeaviness
finalTwoV  finalVowel  finalCoda  finalHeaviness  antepenultVowel  antepenultCoda
antepenultHeaviness  weightPattern  final3stressTrans
```

### Sample Data Row

```
abacus	AE1 B AH0 K AH0 S	100	L.CL.CLC	(AE)(b AH)(k AH s)	antepenult	0	0	1	other
-LC	H	-V	L	-V	L	other	other	shortV	C	C	0	ah	Singleton	S
simple	other	other	noPrefix	noSuffix	 s	1	4.25	NN	3	1	1	1
M	open	noCoda	simple	L	ah	M	closed	L	M	open	L	L L L	100
```

### Column Definitions

The columns are organized by linguistic domain:

**A. Lexical & Corpus Metadata**
- **spelling**: Orthographic form of the word
- **freq**: Zipf-scale log frequency from SUBTLEX (1.00–7.00; "NA" = not applicable)
- **POS**: Penn Treebank Part-of-Speech tag (2–4 characters; see [Penn Treebank Tags](#penn-treebank-part-of-speech-tags))

**B. Phonemic & Syllabic Representation**
- **phones**: ARPAbet phonemes separated by spaces, with numeric stress markers (0/1/2)
- **stressTrans**: Compact stress contour — a contiguous string of digits (e.g., "02100" for *electricity*)
- **syllStruct**: CV transcription of each syllable, dot-separated. C = consonant, L = lax (short) vowel, T = tense (long/diphthong) vowel
- **syllabification**: ARPAbet string segmented into parenthetical syllable boundaries per the Maximal Onset Principle. Capitals mark nuclei.
- **vowelLength**: Classification of the primary-stressed vowel as `shortV` or `longV`

**C. Syllable Weight & Topology (Moraic Metrics)**
- **[position]Weight**: Granular rime structure for final/penult/antepenult/preantepenult syllables. Values: `-V` (short vowel, open), `-VV` (long vowel, open), `-LC` (short vowel + single coda consonant), `-LCC` (short vowel + coda cluster), `-TCC` (long vowel + coda cluster)
- **[position]HLweight**: Binary Heavy (H) or Light (L) evaluation per syllable position (obsolete in favor of [position]Weight)
- **[position]Onset**: Onset complexity per syllable — `0` (null/vowel-initial), `C` (singleton), `CC` (2-consonant cluster), `CCC` (3-consonant cluster)
- **finalC**: Final coda geometry category: `open`, `Singleton`, or `Cluster`
- **codaLength**: Integer count of consonants in the final syllable's coda
- **coda**: Exact ARPAbet phones in the final coda (e.g., `n t` for *restaurant*)
- **finalV**: ARPAbet vowel serving as the final syllable's nucleus (e.g., `aa`, `er`, `ih`)
- **finalTwoV**: Final vowel classified as `-i`, `-ah`, or `other`
- **finalVowel**: Diphthong (D) or monophthong (M) classification of final nucleus
- **finalCoda**: Final coda structure: `closed`, `cluster`, or `open`
- **finalHeaviness**: Weight of final syllable (H/L)
- **penultVowel**: D/M classification of penult nucleus
- **penultCoda**: Penult coda: `closed`, `cluster`, or `open`
- **penultHeaviness**: Weight of penult syllable
- **penultPossibleCoda**: Whether the penult ends in a singleton or cluster, or is followed by an onset cluster that could be attracted as a coda under stress
- **finalComplexOnset**: Whether the final syllable's onset is `simple` or `complex`
- **antepenultVowel**: D/M classification of antepenult nucleus
- **antepenultCoda**: Antepenult coda structure
- **antepenultHeaviness**: Weight of antepenult syllable
- **weightPattern**: H/L weight pattern for the last 3 syllables (NA in first position = 2-syllable word)

**D. Stress Mapping**
- **mainStress**: Which syllable position carries primary stress: `final`, `penult`, `antepenult`, or `preante`
- **finalStress / penultStress / apStress / papStress**: Numeric stress value (0/1/2) per positional syllable (ap = antepenult, pap = pre-antepenult)
- **leftEdgeStress**: Distance of main stress from word onset (1 = initial, 2 = peninitial, 3 = post-peninitial, etc.)
- **initStress**: Numeric stress of the initial syllable
- **singleStress**: `1` = word has exactly one stressed syllable, `0` = at least two
- **final3stressTrans**: Stress contour of the final 3 syllables

**E. Morpho-Phonological Dynamics**
- **morphology**: `simple` or `complex` (presence/absence of derivational affixes)
- **suffixType**: Stress-shift behavior of the suffix (e.g., `penultShift`, `noshiftOneSyll`)
- **prefixType**: Stress behavior of the prefix (e.g., `unstressed`)
- **Prefix**: `prefix` or `noPrefix`
- **Suffix**: `suffix` or `noSuffix`
- **S**: Word-final sibilant classifier: `S`, `SCluster`, `otherSingleton`, or `otherCluster`. Final /s/ or /z/ (often plural/tense markers) behave as extrametrical segments in English phonology.

---

## Penn Treebank Part-of-Speech Tags

The `POS` column uses the Penn Treebank tagset. Here is every tag with its meaning and an example word:

| Tag | Part of Speech | Example |
|---|---|---|
| CC | Coordinating conjunction | and, but, or |
| CD | Cardinal number | one, two, three |
| DT | Determiner | the, a, an |
| EX | Existential *there* | there |
| FW | Foreign word | je ne sais quoi |
| IN | Preposition / subordinating conjunction | in, of, on, although |
| JJ | Adjective | green, large, happy |
| JJR | Adjective, comparative | greener, larger, happier |
| JJS | Adjective, superlative | greenest, largest, happiest |
| LS | List item marker | 1), 2), a), b) |
| MD | Modal | can, will, must, should |
| NN | Noun, singular or mass | table, water, happiness |
| NNS | Noun, plural | tables, waters, happinesses |
| NNP | Proper noun, singular | London, Einstein, Microsoft |
| NNPS | Proper noun, plural | Americans, Smiths, the Netherlands |
| PDT | Predeterminer | all (as in "all the books"), both |
| POS | Possessive ending | 's, ' |
| PRP | Personal pronoun | I, you, he, she, it, we, they |
| PRP$ | Possessive pronoun | my, your, his, her, its, our, their |
| RB | Adverb | quickly, very, however |
| RBR | Adverb, comparative | faster, better, more quickly |
| RBS | Adverb, superlative | fastest, best, most quickly |
| RP | Particle | up (as in "give up"), off, out |
| SYM | Symbol | $, %, +, & |
| TO | *to* (infinitive marker) | to (as in "to go") |
| UH | Interjection | oh, wow, ah, oops |
| VB | Verb, base form | take, eat, run |
| VBD | Verb, past tense | took, ate, ran |
| VBG | Verb, gerund / present participle | taking, eating, running |
| VBN | Verb, past participle | taken, eaten, run |
| VBP | Verb, non-3rd person singular present | take, eat, run (I/you/we/they) |
| VBZ | Verb, 3rd person singular present | takes, eats, runs |
| WDT | Wh-determiner | which, that, whatever |
| WP | Wh-pronoun | who, what, whom |
| WP$ | Possessive wh-pronoun | whose |
| WRB | Wh-adverb | when, where, why, how |

---

## Expert Glossary

**ARPAbet** — A phonetic alphabet used by the CMU Pronouncing Dictionary to encode the sounds of English words. Each token (called a "phone") represents a single speech sound, optionally followed by a stress digit (0/1/2).

**Coda** — The consonant(s) that follow the nucleus within a syllable. The coda, together with the nucleus, forms the *rime*. Coda complexity strongly influences syllable weight.

**CV Notation** — A shorthand encoding a syllable's consonant-vowel structure. Used in NOUNSING-PRO with enhanced symbols: `C` = consonant, `L` = lax/short vowel, `T` = tense/long vowel or diphthong.

**Diphthong (D)** — A vowel quality that glides from one articulatory position to another within a single syllable (e.g., /aɪ/ in "eye"). In the dataset, `D` marks diphthongal nuclei; `M` marks monophthongal (steady-state) nuclei.

**Extrametricality** — A phonological phenomenon where certain segments at word edges (particularly word-final /s/ or /z/ from plural or tense inflection) behave as if they are "invisible" to stress-assignment rules. These segments are said to be *extrametrical*.

**Foot (Metrical Foot)** — A recurring pattern of stressed and unstressed syllables that forms the basic rhythmic unit of verse. NOUNSING-PRO recognizes 16 traditional Greek/English foot types.

**Heaviness (Syllable Weight)** — A binary classification where a syllable is Heavy (H, bimoraic) if its rime contains a long vowel, diphthong, or any coda consonant; and Light (L, monomoraic) if it contains only a short vowel with no coda. Syllable weight is the primary determinant of stress placement in English.

**Maximal Onset Principle (MOP)** — A phonological rule dictating that when syllabifying, as many intervocalic consonants as possible should be assigned to the *onset* of the following syllable, provided the resulting cluster is phonotactically legal. MOP directly impacts syllable weight: a consonant "stolen" by the next syllable's onset leaves the preceding syllable open (and lighter).

**Monophthong (M)** — A vowel with a single, steady articulatory target (e.g., /æ/ in "cat"). Contrasts with diphthong.

**Mora (μ)** — A unit of syllable weight. Light syllables have one mora; heavy syllables have two. The mora is the abstract timing unit that governs stress and poetic meter.

**Nucleus (plural: Nuclei)** — The obligatory core of a syllable, almost always a vowel (though English has syllabic consonants like /l/ in *bottle* or /n/ in *button*). In the syllabification column, capitalized ARPAbet strings flag nuclei.

**Onset** — The consonant(s) that precede the nucleus within a syllable. Onset complexity ranges from null (0, vowel-initial) through singleton (C) to complex clusters (CC, CCC).

**Penult / Antepenult / Preantepenult** — Positional terms for syllables counting from the end of a word: *final* (last), *penult* (second-to-last), *antepenult* (third-to-last), *preantepenult* (fourth-to-last).

**Phone / Phoneme** — A "phone" is a single speech sound token in ARPAbet notation (e.g., `AE1`, `B`, `AH0`). A "phoneme" is the abstract linguistic category; in practical usage within this toolkit, the terms are used interchangeably for the space-separated ARPAbet tokens.

**Poetic Meter** — The systematic arrangement of stressed and unstressed syllables into recurring patterns (feet). The 16 meters recognized by NOUNSING-PRO span disyllabic (iamb, trochee, spondee, pyrrhic), trisyllabic (dactyl, anapest, amphibrach, bacchic, antibacchic, cretic), and tetrasyllabic (choriamb, antispast, four paeons) patterns.

**Rime (Rhyme)** — The nucleus + coda of a syllable (everything after the onset). The *rhyming part* of a word, as used in rhyme search, is the rime of the last stressed syllable plus any following unstressed syllables.

**Scansion** — The act of analyzing a line of verse to determine its metrical pattern. NOUNSING-PRO performs scansion at the word level, classifying each word's stress contour into a traditional foot label.

**Stress** — The relative prominence of a syllable, marked in ARPAbet as `1` (primary, most prominent), `2` (secondary, less prominent), or `0` (unstressed).

**Syllabification** — The division of a word into syllables. NOUNSING-PRO uses syllabifications computed according to the Maximal Onset Principle, with syllable boundaries marked by parentheses and nuclei flagged in capital letters.

**Weight Pattern** — A string of H (Heavy) and L (Light) indicators for the last three syllables of a word. A weight pattern like `L L H` means the final syllable is heavy while the penult and antepenult are light.

**Zipf Frequency** — A logarithmic scale measuring how common a word is across large text corpora. Higher values = more common words. The values in NOUNSING-PRO represent an average of frequencies from across the SUBTLEX corpus (data derived from movie subtitles, approximating spoken English) alongside several large web text and print-based corpora. For the CMU lexicon, the effective frequency range is from 1.00 (rarest) to 7.00 (most common). To our knowledge, the only >7.00 outliers are single characters. On the other extreme, it's plausible that a handful of <1.00 outlier words are present, but this matter remains uninvestigated on our part. Any suchlike <1.00 frequency outlier would have to be a word appearing no more than once in no more than one of the Zipf source corpora, while altogether absent from every other frequency source corpus. If you happen to locate or spot any word quite so rare, we hereby challenge you to actually use it somewhere!

---

## Technical Information

### Build Pipeline

```
npm run build
  ├── build:cjs   → tsc (TypeScript → CommonJS in dist/cjs) + copy newerCMU.tsv
  ├── build:esm   → creates ESM re-export shim at dist/esm/nounsing.mjs
  ├── build:browser → browserify + brfs → dist/nounsing-browser.js
  └── copy:dts    → copies dist/cjs/nounsing.d.ts → ./nounsing.d.ts
```

The `brfs` transform inlines the 31MB `newerCMU.tsv` into the browser bundle during `build:browser`, making the browser version fully self-contained.

### Package Files

| File/Directory | Purpose |
|---|---|
| `src/nounsing.ts` | Core library: data loading, all API functions, TSV parsing |
| `src/cli.ts` | Interactive CLI with all menus, prompts, chalk coloring |
| `src/types.ts` | TypeScript interfaces: WordProfile, WeightMetrics, PhonologyData, etc. |
| `nounsing.d.ts` | Published type declarations (auto-generated from tsc) |
| `src/verse_tscript_rhymer.ts` | Nuanced and metrically constrained rhyming engine, supporting dozens of rhyme types |
| `verse_tscript_rhymer_guide.md` | Technical reference guide for programmatic rhyme types and performance tips |
| `newerCMU.tsv` | The augmented 54-column TSV dictionary (~31MB, 123K+ entries), with morphological, phonological, prosodic, syntactic, statistical (cross-corpus derived usage frequency score under the `freq` column), and other annotations and classifications |
| `dist/cjs/` | Compiled CommonJS output (Node.js consumption) |
| `dist/esm/` | ESM re-export wrapper |
| `dist/nounsing-browser.js` | Self-contained browser bundle (~38MB with inlined dictionary) |
| `test/nounsing.test.ts` | 220+ tape test suite for core library |
| `test/rhymer.test.ts` | 190+ tape test suite for `verse_tscript_rhymer` rhyme classifications |
| `test/manual.test.ts` | Manual verification script |


### Configuration

- **TypeScript**: ES2022 target, CommonJS modules, strict mode (`tsconfig.json`)
- **Browserify**: Uses `brfs` transform to inline filesystem reads (`package.json`, `browserify.transform`)
- **Package exports**: Dual CJS/ESM with types (`package.json`, `exports` field)
- **Published files**: `dist/`, `src/`, `nounsing.d.ts` (`package.json`, `files` field)

---

## Credits & Attribution

NOUNSING-PRO was designed and facilitated by **[Aleksey Calvin Tsukanov](https://huggingface.co/AlekseyCalvin)** on behalf of **[SilverAgePoets.com](https://silveragepoets.com/)**.

The core rhyme, stress, and phonetic search functions (`rhymes`, `rhymingPart`, `stresses`, `search`, `searchStresses`), as well as the rhyme-, stress-, and phoneme-based text rewrites (CLI Menu 3, operations B/C/D), are derived from examples and functions in **Pronouncing** ([Python](https://github.com/aparrish/pronouncingpy) and [JavaScript](https://github.com/aparrish/pronouncingjs)) by **[Allison Parrish](https://www.decontextualize.com/)**, with additional adaptation via **Pronouncing TS** ([npm](https://www.npmjs.com/package/pronouncing)) by Aleksey Calvin Tsukanov.

The morphological/phonological deep-analysis functionalities — including the fine-grained augmentation of the CMU dictionary with 50+ additional linguistic data columns — are based on the work of UCLA's **[Claire Moore Cantwell](https://clairemoorecantwell.org/)**, as found in her [English Stress Statistics](https://github.com/clairemoorecantwell/EnglishStressStatistics) and [Annotate the CMU Dictionary](https://github.com/clairemoorecantwell/annotateCMU) repositories, with additional input from the preeminent linguist and phonologist **[Bruce Hayes](https://brucehayes.org/)** (also at UCLA), and others.

The nuanced rhyming engine (`src/verse_tscript_rhymer.ts`) and its 21 programmatic rhyme types (utilized in CLI Submenus 4 and 5) were extrapolated over **[Verse-Python](https://github.com/austinpursley/verse-python)**, a slant-compatible set of rhyme-matching functions by **[Austin Pursley](https://austinpursley.com/)**. Notably, Verse-Python is itself built on top of Parrish's Pronouncing, with its brilliantly simple finder of perfect rhymes.

The dictionary is built upon the original **[CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)**, a long-standing resource in computational phonology maintained by Carnegie Mellon University, and invoked for augmentation via the [NLTK toolkit](https://github.com/nltk/nltk).
