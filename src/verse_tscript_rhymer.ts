/**
 * Verse-Tscript Rhymer (by Aleksey Calvin Tsukanov, aka A.C.T. SOON®):
 * a TypeScript port and modified extension of Verse-Python (by Austin Pursley).
 * This is a versatile rhyme parser TS tool over the CMU Pronouncing dictionary
 * & Pronouncing.js (a PronouncingPy port) (both libraries by Allison Parrish).
 * @Source (Verse-Python repo): https://github.com/austinpursley/verse-python
 * @Source (single Py Script): https://austinpursley.com/projects/verse_rhymes_and_more.html
 * @Source (CMU): http://www.speech.cs.cmu.edu/cgi-bin/cmudict
 * @Source (Pronouncing Py): https://github.com/aparrish/pronouncingpy, 
 * @Source (Pronouncing.js): https://github.com/aparrish/pronouncingjs
 * My .JS adaptation/expansion of Parrish's guide to Pronouncing Py is at: 
 * https://github.com/AlekseyCalvin/pronouncingjs/blob/master/PronouncingJS_Intro_Guide.md
 * @Also see: https://en.wikipedia.org/wiki/Arpabet
 * 
 * Dependencies:
 *   npm install aparrish/pronouncingjs —save
 * 
 * To use directly in your terminal, launch 'node'
 * CMU dictionary data loads automatically upon a call to a pronouncing function
 * Then:
 *   var pronouncing = require('pronouncing');
 * 
 */

import * as nounsing from './nounsing';

// ============================================================================
// Type definitions
// ============================================================================

/** The 21 rhyme types in the taxonomy. */
export type RhymeType =
  | 'perfect'
  | 'family'
  | 'slant'
  | 'masculine'
  | 'feminine'
  | 'dactylic'
  | 'eye'
  | 'rich'
  | 'assonant'
  | 'consonant'
  | 'augmented'
  | 'diminished'
  | 'syllabic'
  | 'light'
  | 'wrenched'
  | 'grammatical'
  | 'trailing'
  | 'apocopated'
  | 'unstressed'
  | 'mosaic'
  | 'identical';

/** Options for the near-rhyme / slant search. */
export interface SlantOptions {
  /** If true, vowels must match stress markers (default: true). */
  stress?: boolean;
  /** Number of trailing consonant phonemes allowed after the match (default: 0). */
  consonantTail?: number;
}

/** Advanced options for getRhymes. */
export interface GetRhymesOptions {
  phones?: string;
  /** Part-of-Speech precision (0-3). 0 = disabled, 1 = first char, 2 = first 2 chars, 3 = exact Penn tag. */
  posPrecision?: number;
  /** Lexicon Normativity (Zipf) Threshold (e.g. 2.0). Filters candidates with Zipf freq >= threshold. */
  freqThreshold?: number;
  /** Exact syllable count constraint. */
  syllables?: number;
  /** Poetic foot type (e.g., 'iamb', 'trochee', 'dactyl') to filter candidates. */
  poeticFit?: nounsing.PoeticMeter;
  /** Exact stress contour pattern (e.g. '10', '01') to filter candidates. */
  stressPattern?: string;
}

/** Options for regex search scope. */
export type SearchOption = 'end' | 'begin' | 'whole';

/** Direction for assonance / consonance queries. */
export type SearchDirection = 'forward' | 'backward' | null;

/** A rhyme result carrying both the word and its rhyme classification. */
export interface RhymeResult {
  word: string;
  type: RhymeType;
  /** The CMUdict phones string used for the match. */
  phones: string;
}

// ============================================================================
// Constants
// ============================================================================

/** All 21 rhyme types in the taxonomy, in canonical order. */
export const ALL_RHYME_TYPES: readonly RhymeType[] = [
  'perfect', 'family', 'slant', 'masculine', 'feminine', 'dactylic',
  'eye', 'rich', 'assonant', 'consonant', 'augmented', 'diminished',
  'syllabic', 'light', 'wrenched', 'grammatical', 'trailing',
  'apocopated', 'unstressed', 'mosaic', 'identical',
];

/**
 * Consonant families per the CMU / ARPABET phoneme set.
 *
 * Plosives:    voiced B, D, G  | unvoiced P, T, K
 * Fricatives:  voiced V, DH, Z, ZH, JH  | unvoiced F, TH, S, SH, CH
 * Nasals:      M, N, NG
 * Approximants: L, R, W, Y, HH
 *
 * Family rhyme matches require consonants to belong to the same family.
 */
const PLOSIVES = new Set(['B', 'D', 'G', 'P', 'T', 'K']);
const FRICATIVES = new Set(['V', 'DH', 'Z', 'ZH', 'JH', 'F', 'TH', 'S', 'SH', 'CH']);
const NASALS = new Set(['M', 'N', 'NG']);
const APPROXIMANTS = new Set(['L', 'R', 'W', 'Y', 'HH']);

/** Map from base consonant to its family name. */
function consonantFamily(phone: string): string | null {
  const base = phone.replace(/\d$/, ''); // strip any accidental stress digit
  if (PLOSIVES.has(base)) return 'plosive';
  if (FRICATIVES.has(base)) return 'fricative';
  if (NASALS.has(base)) return 'nasal';
  if (APPROXIMANTS.has(base)) return 'approximant';
  return null;
}

/** Returns true if two consonants belong to the same phonetic family. */
function sameFamily(a: string, b: string): boolean {
  const fa = consonantFamily(a);
  const fb = consonantFamily(b);
  return fa !== null && fa === fb;
}

/** Possible English consonant clusters (onsets). */
export function consonantClusters(): readonly string[] {
  return [
    'F W', 'F R', 'F L', 'S W', 'S V',
    'S R', 'S L', 'S N', 'S M', 'S F',
    'S P', 'S T', 'S K', 'SH W', 'SH R',
    'SH L', 'SH N', 'SH M', 'TH W', 'TH R',
    'V W', 'V R', 'V L', 'Z W', 'Z L',
    'B W', 'B R', 'B L', 'D W', 'D R',
    'G W', 'G R', 'G L', 'P W', 'P R',
    'P L', 'T W', 'T R', 'K W', 'K R',
    'K L', 'L Y', 'N Y', 'M Y', 'V Y',
    'H Y', 'F Y', 'S Y', 'TH Y', 'Z Y',
    'B Y', 'D Y', 'G Y', 'P Y', 'T Y',
    'K Y', 'S P L', 'S P R', 'S T R', 'S K R',
    'S K W',
  ] as const;
}

const CONSONANT_CLUSTERS = new Set(consonantClusters());

// ============================================================================
// Memoization & caching
// ============================================================================

/** Max entries for rhyme caches to prevent unbounded growth. */
const MAX_RHYME_CACHE_SIZE = 5000;
const MAX_CLASSIFY_CACHE_SIZE = 2000;

/** Bounded FIFO cache for getRhymes results. */
const rhymeCache = new Map<string, string[]>();

/** Bounded FIFO cache for classifyRhyme results. */
const classifyCache = new Map<string, RhymeType[]>();

function getRhymeCacheKey(
  word: string,
  type: RhymeType,
  phones?: string,
  options?: GetRhymesOptions
): string {
  const parts = [word.toLowerCase(), type, phones ?? ''];
  if (options) {
    parts.push(
      `pos:${options.posPrecision ?? ''}`,
      `freq:${options.freqThreshold ?? ''}`,
      `syll:${options.syllables ?? ''}`,
      `poetic:${options.poeticFit ?? ''}`,
      `stress:${options.stressPattern ?? ''}`
    );
  }
  return parts.join('|');
}

function setBoundedCache<T>(cache: Map<string, T>, key: string, value: T, maxSize: number): void {
  if (cache.size >= maxSize) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
  cache.set(key, value);
}

// ============================================================================
// Spelling index for eye-rhyme searches
// ============================================================================

let allWordsCache: string[] | null = null;
let spellingIndexCache: Map<string, string[]> | null = null;

/** Lazily loads the full CMU word list by mapping nounsing.pronunciations. */
function getAllWords(): string[] {
  if (allWordsCache) return allWordsCache;
  allWordsCache = unique(nounsing.pronunciations.map((p) => p[0]));
  return allWordsCache;
}

/**
 * Builds a suffix spelling index: Map from last-3 / last-4 grapheme endings
 * to the list of words that end that way. Used by eyeRhyme only.
 */
function getSpellingIndex(): Map<string, string[]> {
  if (spellingIndexCache) return spellingIndexCache;
  spellingIndexCache = new Map();
  for (const word of getAllWords()) {
    const w = word.toLowerCase();
    if (w.length < 3) continue;
    const e3 = w.slice(-3);
    const e4 = w.length >= 4 ? w.slice(-4) : e3;
    if (!spellingIndexCache.has(e3)) spellingIndexCache.set(e3, []);
    spellingIndexCache.get(e3)!.push(word);
    if (e4 !== e3) {
      if (!spellingIndexCache.has(e4)) spellingIndexCache.set(e4, []);
      spellingIndexCache.get(e4)!.push(word);
    }
  }
  return spellingIndexCache;
}

// ============================================================================
// Phoneme helpers
// ============================================================================

/** Returns true if the given CMUdict phonemes form a consonant cluster. */
export function isConsonantCluster(phones: string): boolean {
  return CONSONANT_CLUSTERS.has(phones);
}

/** Returns true if the CMUdict phoneme is a vowel. */
export function isVowel(phone: string): boolean {
  return '012'.includes(phone.slice(-1));
}

/** Returns true if the CMUdict phoneme is a stressed vowel. */
export function isStressedVowel(phone: string): boolean {
  return '12'.includes(phone.slice(-1));
}

/** Returns true if the CMUdict phoneme is a non-stressed vowel. */
export function isUnstressedVowel(phone: string): boolean {
  return phone.endsWith('0');
}

/** Returns true if the CMUdict phoneme is a consonant. */
export function isConsonant(phone: string): boolean {
  return !'012'.includes(phone.slice(-1));
}

/** Returns the base vowel (ARPABET symbol) without stress. */
export function vowelBase(phone: string): string {
  return phone.slice(0, 2);
}

/** Returns the stress digit of a vowel phoneme, or null for consonants. */
export function stressOf(phone: string): number | null {
  const last = phone.slice(-1);
  if ('012'.includes(last)) return parseInt(last, 10);
  return null;
}

// ============================================================================
// Collection helpers
// ============================================================================

/** Removes duplicates from an array while preserving insertion order. */
export function unique<T>(dataList: readonly T[]): T[] {
  return [...new Set(dataList)];
}

/** Returns true if every element in `dataList` equals `val`. */
export function allTheSame<T>(dataList: readonly T[], val: T): boolean {
  return dataList.length > 0 && dataList.every((item) => item === val);
}

/** Fisher-Yates shuffle (in-place). */
export function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ============================================================================
// Phone retrieval helpers
// ============================================================================

/**
 * Chooses a random set of CMUdict phonemes for a word.
 * @returns Empty string if the word is not in the dictionary.
 */
export function randomPhonesForWord(word: string): string {
  const allPhones = nounsing.phonesForWord(word);
  if (!allPhones || allPhones.length === 0) return '';
  const idx = Math.floor(Math.random() * allPhones.length);
  return allPhones[idx];
}

/**
 * Chooses the first set of CMUdict phonemes for a word.
 * @returns Empty string if the word is not in the dictionary.
 */
export function firstPhonesForWord(word: string): string {
  const allPhones = nounsing.phonesForWord(word);
  if (!allPhones || allPhones.length === 0) return '';
  return allPhones[0];
}

// ============================================================================
// Stress / syllable analysis
// ============================================================================

/**
 * Returns the stress pattern of a phones string (e.g. "102").
 */
export function stressPattern(phones: string): string {
  return nounsing.stresses(phones);
}

/**
 * Counts syllables in a phones string.
 */
export function syllableCount(phones: string): number {
  return nounsing.syllableCount(phones);
}

/**
 * Returns the index positions of stressed vowels (1 or 2) in the phone list.
 */
export function stressedVowelIndices(phonesList: readonly string[]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < phonesList.length; i++) {
    if (isStressedVowel(phonesList[i])) indices.push(i);
  }
  return indices;
}

/**
 * Returns the index of the last stressed vowel, or -1 if none.
 */
export function lastStressedVowelIndex(phonesList: readonly string[]): number {
  for (let i = phonesList.length - 1; i >= 0; i--) {
    if (isStressedVowel(phonesList[i])) return i;
  }
  return -1;
}

/**
 * Returns the index of the penultimate stressed vowel, or -1.
 */
export function penultimateStressedVowelIndex(phonesList: readonly string[]): number {
  const stressed = stressedVowelIndices(phonesList);
  if (stressed.length >= 2) return stressed[stressed.length - 2];
  return -1;
}

/**
 * Returns the index of the antepenultimate stressed vowel, or -1.
 */
export function antepenultimateStressedVowelIndex(phonesList: readonly string[]): number {
  const stressed = stressedVowelIndices(phonesList);
  if (stressed.length >= 3) return stressed[stressed.length - 3];
  return -1;
}

/**
 * Returns the "rhyming part" â€” everything from the last stressed vowel
 * to the end of the word. Same as nounsing.rhymingPart().
 */
export function rhymingPart(phones: string): string {
  return nounsing.rhymingPart(phones);
}

/**
 * Returns the rhyming part starting from a specific vowel index.
 */
export function rhymingPartFromIndex(phonesList: readonly string[], vowelIndex: number): string {
  return phonesList.slice(vowelIndex).join(' ');
}

/**
 * Returns the onset (consonants before the vowel at `vowelIndex`).
 */
export function onsetBefore(phonesList: readonly string[], vowelIndex: number): string[] {
  const onset: string[] = [];
  for (let i = vowelIndex - 1; i >= 0; i--) {
    const phone = phonesList[i];
    if (isConsonant(phone)) {
      onset.unshift(phone);
    } else {
      break;
    }
  }
  return onset;
}

/**
 * Returns the coda (consonants after the vowel at `vowelIndex`, up to next vowel or end).
 */
export function codaAfter(phonesList: readonly string[], vowelIndex: number): string[] {
  const coda: string[] = [];
  for (let i = vowelIndex + 1; i < phonesList.length; i++) {
    const phone = phonesList[i];
    if (isConsonant(phone)) {
      coda.push(phone);
    } else {
      break;
    }
  }
  return coda;
}

// ============================================================================
// Structural rhyme classifiers (masculine / feminine / dactylic)
// ============================================================================

/**
 * Classifies a word's stress pattern into structural rhyme categories.
 * A word can be simultaneously masculine, feminine, and/or dactylic
 * depending on how many stressed syllables it has.
 *
 * - Masculine: stress falls on the final syllable
 * - Feminine:  stress falls on the penultimate syllable
 * - Dactylic:  stress falls on the antepenultimate syllable
 */
export function structuralRhymeTypes(word: string, phones?: string): RhymeType[] {
  // If no custom phones are passed, try checking nounsing's high-fidelity stress profiles first
  if (phones === undefined) {
    const stressProfiles = nounsing.stress(word);
    if (stressProfiles && stressProfiles.length > 0) {
      const types: RhymeType[] = [];
      for (const profile of stressProfiles) {
        const ms = profile.mainStress;
        if (ms === 'final') types.push('masculine');
        else if (ms === 'penult') types.push('feminine');
        else if (ms === 'antepenult') types.push('dactylic');
      }
      if (types.length > 0) {
        return unique(types);
      }
    }
  }

  // Fallback to phone-based scansion
  const resolvedPhones = phones ?? firstPhonesForWord(word);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const stressed = stressedVowelIndices(phonesList);
  if (stressed.length === 0) return [];

  const totalSyllables = syllableCount(resolvedPhones);
  const types: RhymeType[] = [];

  // map each vowel (stressed or not) to its syllable position
  const vowelIndices = phonesList.map((p,i)=> isVowel(p)? i : -1).filter(i=> i>=0);

  for (const idx of stressed) {
    const pos = vowelIndices.indexOf(idx) + 1; // 1-based syllable position
    const distanceFromEnd = totalSyllables - pos;

    if (distanceFromEnd === 0) types.push('masculine');
    if (distanceFromEnd === 1) types.push('feminine');
    if (distanceFromEnd === 2) types.push('dactylic');
  }

  return unique(types);
}

/**
 * Checks if a word is masculine (final syllable stressed).
 */
export function isMasculine(word: string, phones?: string): boolean {
  return structuralRhymeTypes(word, phones).includes('masculine');
}

/**
 * Checks if a word is feminine (penultimate syllable stressed).
 */
export function isFeminine(word: string, phones?: string): boolean {
  return structuralRhymeTypes(word, phones).includes('feminine');
}

/**
 * Checks if a word is dactylic (antepenultimate syllable stressed).
 */
export function isDactylic(word: string, phones?: string): boolean {
  return structuralRhymeTypes(word, phones).includes('dactylic');
}

// ============================================================================
// Core rhyme functions â€” 21-category taxonomy
// ============================================================================

/**
 * PERFECT RHYME
 * Like: beat/street/incomplete/eat/elite/receipt; June/moon
 * Exactly matched last-stressed syllable phoneme. The number of unstressed
 * syllables preceding the last stressed syllable is immaterial.
 *
 * Condition: last stressed vowel and ALL subsequent phonemes match exactly.
 */
export function perfectRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  let candidates = nounsing.rhymes(word);
  candidates = candidates.filter((w) => w !== word);

  if (candidates.length === 0) {
    // Fallback via rhymingPart search
    const rp = nounsing.rhymingPart(resolvedPhones);
    if (!rp) return [];
    candidates = nounsing.search(rp + '$');
    candidates = candidates.filter((w) => w !== word);
  }

  // Deduplicate and sort by length (shortest first) so that commoner words
  // are retained when the caller bounds the pool.
  candidates = unique(candidates);
  candidates.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return candidates;
}

/**
 * FAMILY RHYME
 * Like: wet/deck; dame/grain; float/yoke; math/pass
 * Stressed vowels match exactly, while consonant sounds belong to the same
 * phonetic family (plosives, fricatives, or nasals).
 */
export function familyRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const lastStressIdx = lastStressedVowelIndex(phonesList);
  if (lastStressIdx === -1) return [];

  const targetVowel = phonesList[lastStressIdx];
  const targetCoda = codaAfter(phonesList, lastStressIdx);

  // Search with exact stress for speed, then relax the vowel match in the
  // filter to accept primary/secondary stress variants of the same vowel.
  const baseSearch = targetCoda.length > 0
    ? targetVowel + ' ' + targetCoda.map(() => '.{1,3}').join(' ')
    : targetVowel;
  const candidates = nounsing.search(baseSearch + '$');

  const results: string[] = [];
  for (const candidate of candidates) {
    if (candidate === word) continue;
    const cPhonesList = firstPhonesForWord(candidate).split(' ');
    const cLastStressIdx = lastStressedVowelIndex(cPhonesList);
    if (cLastStressIdx === -1) continue;

    const cVowel = cPhonesList[cLastStressIdx];
    if (vowelBase(cVowel) !== vowelBase(targetVowel)) continue;

    const cCoda = codaAfter(cPhonesList, cLastStressIdx);
    if (cCoda.length !== targetCoda.length) continue;

    let allFamilyMatch = true;
    for (let i = 0; i < targetCoda.length; i++) {
      if (!sameFamily(targetCoda[i], cCoda[i])) {
        allFamilyMatch = false;
        break;
      }
    }
    if (allFamilyMatch) results.push(candidate);
  }

  return unique(results);
}

/**
 * SLANT RHYME (near rhyme)
 * Like: prayer/despair, air/cigar
 * Close but imperfect; typically the match is between final consonants.
 * We implement this as: at least one phoneme after the last stressed vowel
 * matches, but not all of them (otherwise it would be perfect).
 */
export function slantRhyme(word: string, phones?: string, options: SlantOptions = {}): string[] {
  const { stress = true, consonantTail = 0 } = options;
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const rp = nounsing.rhymingPart(resolvedPhones);
  const searchCombos = wildcardMixPhonesRegexSearches(rp, stress);
  let rhymes: string[] = [];

  for (const search of searchCombos) {
    rhymes = rhymes.concat(
      nounsing.search(search + `( .{1,3}){0,${consonantTail}}$`)
    );
  }

  if (rhymes.length > 0) {
    rhymes = unique(rhymes);
    rhymes = rhymes.filter((r) => r !== word);
    return rhymes;
  }

  return [];
}

/**
 * MASCULINE RHYME
 * Also known as single rhyme â€” rhyming stress falls on the final syllable.
 * This is a structural filter applied to perfect (or other) rhymes.
 */
export function masculineRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const allPerfect = perfectRhyme(word, resolvedPhones);
  return allPerfect.filter((w) => isMasculine(w));
}

/**
 * FEMININE RHYME
 * Also known as double rhyme â€” rhyming stress falls on the penultimate syllable.
 * Can be compound: composed of multiple matching syllables across word boundaries.
 */
export function feminineRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const allPerfect = perfectRhyme(word, resolvedPhones);
  return allPerfect.filter((w) => isFeminine(w));
}

/**
 * DACTYLIC RHYME
 * Rhyme with stress on the antepenultimate (third from last) syllable.
 * Can be compound across word boundaries.
 */
export function dactylicRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const allPerfect = perfectRhyme(word, resolvedPhones);
  return allPerfect.filter((w) => isDactylic(w));
}

/**
 * EYE RHYME
 * Like: prove/love
 * Visual similarity without sonic/phonetic match.
 * Searches the CMU dictionary by spelling (graphemes), not phonemes.
 */
export function eyeRhyme(word: string): string[] {
  const w = word.toLowerCase();
  if (w.length < 3) return [];

  const ending3 = w.slice(-3);
  const ending4 = w.length >= 4 ? w.slice(-4) : ending3;

  // Use the spelling suffix index for fast candidate lookup
  const index = getSpellingIndex();
  const candidates = new Set<string>();
  const c3 = index.get(ending3);
  const c4 = index.get(ending4);
  if (c3) c3.forEach(c => candidates.add(c));
  if (c4) c4.forEach(c => candidates.add(c));

  const wPhones = firstPhonesForWord(word);
  if (!wPhones) return [];
  const wRp = nounsing.rhymingPart(wPhones);

  const results: string[] = [];
  for (const candidate of candidates) {
    if (candidate.toLowerCase() === w) continue;
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;
    const cRp = nounsing.rhymingPart(cPhones);
    // eye rhyme = same spelling ending, DIFFERENT rhyming part
    if (cRp && wRp && cRp !== wRp) {
      results.push(candidate);
    }
  }

  return unique(results);
}

/**
 * RICH RHYME
 * Like: belief/leaf
 * Rhyme between homophones or near-homophones with utterly distinct spelling.
 * The opposite of an eye rhyme.
 */
export function richRhyme(word: string): string[] {
  const wPhones = firstPhonesForWord(word);
  if (!wPhones) return [];

  // Search for exact phoneme matches using the whole-word pattern
  const wList = wPhones.split(' ');
  const search = '^' + wList.join(' ') + '$';
  const allWords = nounsing.search(search);
  const results: string[] = [];

  for (const candidate of allWords) {
    if (candidate === word) continue;
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;

    // Verify: near-homophone with distinct spelling
    const cList = cPhones.split(' ');
    const samePhones = wList.length === cList.length &&
      wList.every((p, i) => p === cList[i]);

    if (samePhones) {
      const wNorm = word.toLowerCase().replace(/[^a-z]/g, '');
      const cNorm = candidate.toLowerCase().replace(/[^a-z]/g, '');
      if (wNorm !== cNorm) {
        results.push(candidate);
      }
    }
  }

  return unique(results);
}

/**
 * ASSONANT RHYME
 * Like: Eyes/Paradise
 * Only the vowel sounds match; surrounding consonants may be completely different.
 */
export function assonantRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const searchList: string[] = [];

  for (let i = phonesList.length - 1; i >= 0; i--) {
    const phone = phonesList[i];

    if (isUnstressedVowel(phone)) {
      searchList.push(vowelBase(phone) + '.');
    } else if (isStressedVowel(phone)) {
      searchList.push(vowelBase(phone) + '.'); // ignore stress
      searchList.reverse();
      const search = searchList.join(' ') + '$';
      let rhymes = nounsing.search(search);
      rhymes = unique(rhymes);
      rhymes = rhymes.filter((r) => r !== word);
      return rhymes;
    } else if (isConsonant(phone)) {
      searchList.push('.{1,3}');
    }
  }

  return [];
}

/**
 * CONSONANT RHYME (para-rhyme)
 * Like: heal/hell
 * Only the consonant frame matches; vowel sounds/phones are different.
 */
export function consonantRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const searchList: string[] = [];

  for (let i = phonesList.length - 1; i >= 0; i--) {
    const phone = phonesList[i];

    if (isStressedVowel(phone)) {
      searchList.push('.{1,3}');
      if (allTheSame(searchList, '.{1,3}')) break;
      searchList.reverse();
      const search = searchList.join(' ') + '$';
      let rhymes = nounsing.search(search);
      rhymes = unique(rhymes);
      rhymes = rhymes.filter((r) => r !== word);
      return rhymes;
    } else if (isUnstressedVowel(phone)) {
      searchList.push('.{1,3}');
    } else if (isConsonant(phone)) {
      searchList.push(phone);
    }
  }

  return [];
}

/**
 * AUGMENTED RHYME
 * Like: bray/brave, grow/sown
 * The rhyming word (latter word of pair) carries an additional consonant.
 * We find words where the target word is a prefix of the rhyme's ending.
 */
export function augmentedRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const lastStressIdx = lastStressedVowelIndex(phonesList);
  if (lastStressIdx === -1) return [];

  const targetPart = phonesList.slice(lastStressIdx).join(' ');
  // Search for words whose ending CONTAINS the target part as a prefix
  // but has additional consonant(s) after
  const search = targetPart + ' .{1,3}$';
  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * DIMINISHED RHYME
 * Like: brave/day, blown/sow, stained/rain
 * Reversal of augmented rhyme. The rhymed-with word carries an additional consonant.
 */
export function diminishedRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const lastStressIdx = lastStressedVowelIndex(phonesList);
  if (lastStressIdx === -1) return [];

  // The target word has extra consonants; we look for shorter versions
  const targetVowel = phonesList[lastStressIdx];
  const targetCoda = codaAfter(phonesList, lastStressIdx);

  if (targetCoda.length === 0) return [];

  // Try removing the last consonant from the coda
  const shorterCoda = targetCoda.slice(0, -1);
  const search = targetVowel + (shorterCoda.length > 0 ? ' ' + shorterCoda.join(' ') : '') + '$';
  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * SYLLABIC RHYME
 * Like: cleaver/silver, bottle/fiddle
 * The last syllable of each word sounds the same but does not necessarily
 * contain stressed vowels.
 */
export function syllabicRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  // Find the last vowel (stressed or unstressed)
  let lastVowelIdx = -1;
  for (let i = phonesList.length - 1; i >= 0; i--) {
    if (isVowel(phonesList[i])) {
      lastVowelIdx = i;
      break;
    }
  }
  if (lastVowelIdx === -1) return [];

  const search = phonesList.slice(lastVowelIdx).join(' ') + '$';
  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * LIGHT RHYME
 * Like: nets/carpets, he/poverty
 * Rhymes a primary/normatively stressed syllable with a secondarily stressed
 * or unstressed syllable, disrupting conventional stress patterning.
 */
export function lightRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const lastStressIdx = lastStressedVowelIndex(phonesList);
  if (lastStressIdx === -1) return [];

  const targetPart = phonesList.slice(lastStressIdx).join(' ');
  // Find words where this same phoneme sequence appears but is NOT the
  // last stressed vowel (i.e., it's an earlier syllable, or unstressed)
  const allWords = nounsing.search(targetPart).slice(0, 200);
  const results: string[] = [];

  for (const candidate of allWords) {
    if (candidate === word) continue;
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;
    const cList = cPhones.split(' ');
    const cLastStressIdx = lastStressedVowelIndex(cList);

    // The match must NOT be at the last stressed position
    // i.e., the rhyming part is NOT the rhyming part of the candidate
    const cRp = nounsing.rhymingPart(cPhones);
    const targetRp = nounsing.rhymingPart(resolvedPhones);
    if (cRp !== targetRp) {
      results.push(candidate);
    }
  }

  return unique(results);
}

/**
 * WRENCHED RHYME
 * Like: manifestation/attraction/convention
 * Rhyme based solely in matched suffixes, without any corresponding or
 * preceding stressed vowel homophonies.
 */
export function wrenchedRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  // Get the final consonant cluster / suffix phonemes (after last vowel)
  let lastVowelIdx = -1;
  for (let i = phonesList.length - 1; i >= 0; i--) {
    if (isVowel(phonesList[i])) {
      lastVowelIdx = i;
      break;
    }
  }
  if (lastVowelIdx === -1) return [];

  const suffixPhones = phonesList.slice(lastVowelIdx + 1);
  if (suffixPhones.length === 0) return [];
  // Prevent runaway regex on very short suffixes for long words.
  // A single-phoneme suffix like 'N' produces a regex that matches
  // nearly every word ending in N, which can take 30+ seconds over 120K entries.
  if (suffixPhones.length < 2 && phonesList.length > 6) return [];
  const suffix = suffixPhones.join(' ');

  // Search for words ending in the same suffix but with DIFFERENT last vowels
  const search = '.{1,3} ' + suffix + '$';
  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes).slice(0, 200);

  const results: string[] = [];
  for (const candidate of rhymes) {
    if (candidate === word) continue;
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;
    const cList = cPhones.split(' ');
    let cLastVowelIdx = -1;
    for (let i = cList.length - 1; i >= 0; i--) {
      if (isVowel(cList[i])) {
        cLastVowelIdx = i;
        break;
      }
    }
    if (cLastVowelIdx === -1) continue;
    // Different vowel before the suffix
    if (vowelBase(cList[cLastVowelIdx]) !== vowelBase(phonesList[lastVowelIdx])) {
      results.push(candidate);
    }
  }

  return results;
}

/**
 * GRAMMATICAL RHYME
 * Like: pun/running/funny
 * Rhyme between words with matching stressed vowel sound at their roots,
 * but distinct inflectional suffixes or endings.
 *
 * We approximate this by finding words that share the same root phonemes
 * but have different endings (morphological variants).
 */
export function grammaticalRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const lastStressIdx = lastStressedVowelIndex(phonesList);
  if (lastStressIdx === -1) return [];

  // Get the root (everything before the last syllable's coda)
  const rootEnd = lastStressIdx + 1; // up to and including the stressed vowel
  const root = phonesList.slice(0, rootEnd).join(' ');

  const allWords = nounsing.search('^' + root);
  const results: string[] = [];

  for (const candidate of allWords) {
    if (candidate === word) continue;
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;
    const cList = cPhones.split(' ');
    const cLastStressIdx = lastStressedVowelIndex(cList);
    if (cLastStressIdx === -1) continue;

    // Same stressed vowel at root
    if (vowelBase(cList[cLastStressIdx]) === vowelBase(phonesList[lastStressIdx])) {
      // But different overall word (different suffix/ending)
      if (cPhones !== resolvedPhones) {
        results.push(candidate);
      }
    }
  }

  return unique(results);
}

/**
 * TRAILING RHYME
 * Like: ring/finger, scout/doubter
 * The rhyming part (target) is the first syllable of a two-syllable word
 * (or the first word in a pair of monosyllabic words).
 */
export function trailingRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const lastStressIdx = lastStressedVowelIndex(phonesList);
  if (lastStressIdx === -1) return [];

  // The "trailing" part is the onset + stressed vowel of the last syllable
  // We look for words where this same sequence appears as the FIRST syllable
  const targetOnset = onsetBefore(phonesList, lastStressIdx);
  const targetVowel = phonesList[lastStressIdx];
  const search = '^' + targetOnset.join(' ') + (targetOnset.length ? ' ' : '') + targetVowel;

  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * APOCOPATED RHYME
 * Like: finger/ring, doubter/scout
 * The rhymed-with part (source) is the first syllable of a two-syllable word.
 * Reversal of the trailing rhyme.
 */
export function apocopatedRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const stressed = stressedVowelIndices(phonesList);
  if (stressed.length < 2) return [];

  // The "apocopated" part is the first stressed syllable
  const firstStressIdx = stressed[0];
  const firstOnset = onsetBefore(phonesList, firstStressIdx);
  const firstVowel = phonesList[firstStressIdx];

  // Look for words that end with this same sequence (i.e., the first syllable
  // of the source word rhymes with a standalone word)
  const search = firstOnset.join(' ') + (firstOnset.length ? ' ' : '') + firstVowel + '$';
  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * UNSTRESSED RHYME
 * Like: forgiven/hidden, prison/heaven, very/sorry
 * Rhymes which fall on the unstressed syllable.
 */
export function unstressedRhyme(word: string, phones?: string): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  // Find the last UNstressed vowel
  let lastUnstressedIdx = -1;
  for (let i = phonesList.length - 1; i >= 0; i--) {
    if (isUnstressedVowel(phonesList[i])) {
      lastUnstressedIdx = i;
      break;
    }
  }
  if (lastUnstressedIdx === -1) return [];

  const search = phonesList.slice(lastUnstressedIdx).join(' ') + '$';
  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);

  // Filter: the match must fall on an unstressed syllable in the candidate too
  const results: string[] = [];
  for (const candidate of rhymes) {
    if (candidate === word) continue;
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;
    const cList = cPhones.split(' ');
    const cLastStressIdx = lastStressedVowelIndex(cList);
    // The matching part should NOT be the last stressed syllable
    const matchStart = cList.length - (phonesList.length - lastUnstressedIdx);
    if (matchStart < 0) continue;
    if (cLastStressIdx !== matchStart) {
      results.push(candidate);
    }
  }

  return results;
}

/**
 * MOSAIC RHYME
 * Like: astronomical/solemn and comical
 * Complex compound rhymes aligning cumulative matching of several features:
 * homophonies, consonant family-matches, scansion (stress pattern), across
 * syllabic sequences or entire sub-phrases.
 *
 * We implement this as a multi-criteria search that rewards partial matches
 * across vowels, consonants, and stress patterns.
 */
export function mosaicRhyme(word: string, phones?: string, minMatchScore = 0.5): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  const phonesList = resolvedPhones.split(' ');
  const targetStress = stressPattern(resolvedPhones);

  // Generate wildcard combinations with varying levels of specificity
  const searchCombos = wildcardMixPhonesRegexSearches(resolvedPhones, false);
  const candidates = new Set<string>();

  for (const search of searchCombos) {
    const matches = nounsing.search(search);
    for (const m of matches) {
      if (m !== word) candidates.add(m);
    }
  }

  const results: string[] = [];
  for (const candidate of candidates) {
    const cPhones = firstPhonesForWord(candidate);
    if (!cPhones) continue;
    const cList = cPhones.split(' ');

    // Calculate match score across multiple dimensions
    let score = 0;
    const maxLen = Math.max(phonesList.length, cList.length);

    // Vowel matches (with stress ignored)
    const targetVowels = phonesList.filter(isVowel).map(vowelBase);
    const candVowels = cList.filter(isVowel).map(vowelBase);
    const vowelMatches = targetVowels.filter((v, i) => candVowels[i] === v).length;
    score += (vowelMatches / Math.max(targetVowels.length, candVowels.length, 1)) * 0.4;

    // Consonant family matches
    const targetCons = phonesList.filter(isConsonant);
    const candCons = cList.filter(isConsonant);
    const consMatches = targetCons.filter((c, i) =>
      candCons[i] && sameFamily(c, candCons[i])
    ).length;
    score += (consMatches / Math.max(targetCons.length, candCons.length, 1)) * 0.3;

    // Stress pattern similarity
    const candStress = stressPattern(cPhones);
    const stressMatches = targetStress.split('').filter((s, i) => candStress[i] === s).length;
    score += (stressMatches / Math.max(targetStress.length, candStress.length, 1)) * 0.3;

    if (score >= minMatchScore) {
      results.push(candidate);
    }
  }

  return unique(results);
}

/**
 * IDENTICAL RHYME
 * Like: "indeed, the doll had shaken" / "I froze, profoundly shaken"
 * Same exact word reused.
 */
export function identicalRhyme(word: string): string[] {
  // The word itself is the only identical rhyme
  return [word];
}

// ============================================================================
// Unified dispatcher
// ============================================================================

/**
 * Applies optional filters to candidate rhyme words based on GetRhymesOptions.
 * Results are returned without arbitrary count limits.
 */
function applyFiltering(
  targetWord: string,
  candidates: string[],
  options?: GetRhymesOptions
): string[] {
  if (!options) return candidates;

  let filtered = candidates;

  // 1. Part-of-Speech precision filter (posPrecision)
  if (options.posPrecision && options.posPrecision >= 1 && options.posPrecision <= 3) {
    const targetLex = nounsing.lexicon(targetWord);
    if (targetLex && targetLex.length > 0) {
      const targetPos = targetLex[0].pos;
      if (targetPos && targetPos !== 'NA') {
        const targetPrefix = targetPos.substring(0, options.posPrecision).toUpperCase();
        filtered = filtered.filter(candidate => {
          const candidateLex = nounsing.lexicon(candidate);
          if (!candidateLex || candidateLex.length === 0) return false;
          const candidatePos = candidateLex[0].pos;
          return candidatePos && candidatePos !== 'NA' && candidatePos.substring(0, options.posPrecision!).toUpperCase() === targetPrefix;
        });
      }
    }
  }

  // 2. Lexicon Normativity (Zipf) Threshold (freqThreshold)
  if (options.freqThreshold !== undefined && options.freqThreshold >= 1.0) {
    filtered = filtered.filter(candidate => {
      const candidateLex = nounsing.lexicon(candidate);
      if (!candidateLex || candidateLex.length === 0) return false;
      const f = parseFloat(candidateLex[0].freq);
      return !isNaN(f) && f >= options.freqThreshold!;
    });
  }

  // 3. Exact syllable count constraint (syllables)
  if (options.syllables !== undefined && options.syllables > 0) {
    filtered = filtered.filter(candidate => {
      const cPhones = firstPhonesForWord(candidate);
      if (!cPhones) return false;
      return syllableCount(cPhones) === options.syllables;
    });
  }

  // 4. Poetic foot type fit (poeticFit)
  if (options.poeticFit) {
    filtered = filtered.filter(candidate => {
      return nounsing.poeticFit(candidate, options.poeticFit!);
    });
  }

  // 5. Exact stress contour pattern (stressPattern)
  if (options.stressPattern) {
    filtered = filtered.filter(candidate => {
      const cPhones = firstPhonesForWord(candidate);
      if (!cPhones) return false;
      return stressPattern(cPhones) === options.stressPattern;
    });
  }

  return filtered;
}

/**
 * Dispatches to the appropriate rhyme function based on the requested type.
 * Results are memoized and returned without arbitrary count limits.
 */
export function getRhymes(
  word: string,
  type: RhymeType,
  phonesOrOptions?: string | GetRhymesOptions
): string[] {
  let phones: string | undefined = undefined;
  let options: GetRhymesOptions | undefined = undefined;

  if (typeof phonesOrOptions === 'string') {
    phones = phonesOrOptions;
  } else if (phonesOrOptions && typeof phonesOrOptions === 'object') {
    options = phonesOrOptions;
    phones = options.phones;
  }

  const key = getRhymeCacheKey(word, type, phones, options);
  const cached = rhymeCache.get(key);
  if (cached !== undefined) return cached;

  let result: string[];
  switch (type) {
    case 'perfect':      result = perfectRhyme(word, phones); break;
    case 'family':       result = familyRhyme(word, phones); break;
    case 'slant':        result = slantRhyme(word, phones); break;
    case 'masculine':    result = masculineRhyme(word, phones); break;
    case 'feminine':     result = feminineRhyme(word, phones); break;
    case 'dactylic':     result = dactylicRhyme(word, phones); break;
    case 'eye':          result = eyeRhyme(word); break;
    case 'rich':         result = richRhyme(word); break;
    case 'assonant':     result = assonantRhyme(word, phones); break;
    case 'consonant':    result = consonantRhyme(word, phones); break;
    case 'augmented':    result = augmentedRhyme(word, phones); break;
    case 'diminished':   result = diminishedRhyme(word, phones); break;
    case 'syllabic':     result = syllabicRhyme(word, phones); break;
    case 'light':        result = lightRhyme(word, phones); break;
    case 'wrenched':     result = wrenchedRhyme(word, phones); break;
    case 'grammatical':  result = grammaticalRhyme(word, phones); break;
    case 'trailing':     result = trailingRhyme(word, phones); break;
    case 'apocopated':   result = apocopatedRhyme(word, phones); break;
    case 'unstressed':   result = unstressedRhyme(word, phones); break;
    case 'mosaic':       result = mosaicRhyme(word, phones); break;
    case 'identical':    result = identicalRhyme(word); break;
    default:
      throw new Error(`Unknown rhyme type: ${type}`);
  }

  // Apply advanced options / filters if present before slicing
  if (options) {
    result = applyFiltering(word, result, options);
  }

  // Cache and return results unbounded internally
  setBoundedCache(rhymeCache, key, result, MAX_RHYME_CACHE_SIZE);
  return result;
}

/**
 * Returns all rhyme types that apply to a given word pair.
 * Optimised with memoization, fast-path checks, and direct phonetic
 * comparison (unbounded) for accuracy.
 *
 * By default mosaicRhyme is skipped because it can take 2–3 minutes.
 * Pass `{ includeMosaic: true }` to include it.
 */
export function classifyRhyme(
  wordA: string,
  wordB: string,
  options?: { includeMosaic?: boolean }
): RhymeType[] {
  const mosaicFlag = options?.includeMosaic ?? false;
  const key = `${wordA.toLowerCase()}|${wordB.toLowerCase()}|${mosaicFlag}`;
  const cached = classifyCache.get(key);
  if (cached !== undefined) return cached;

  const types: RhymeType[] = [];

  // Fast path: identical
  if (wordA.toLowerCase() === wordB.toLowerCase()) {
    types.push('identical');
    setBoundedCache(classifyCache, key, types, MAX_CLASSIFY_CACHE_SIZE);
    return types;
  }

  // Fast path: rich rhymes are homophones with different spelling.
  // Rich implies perfect, so we can return early.
  if (richRhyme(wordA).includes(wordB)) {
    types.push('rich');
    types.push('perfect');
    types.push(...structuralRhymeTypes(wordB));
    const result = unique(types);
    setBoundedCache(classifyCache, key, result, MAX_CLASSIFY_CACHE_SIZE);
    return result;
  }

  // Fast path: perfect (nounsing.rhymes is O(1) via internal index)
  const perfectRhymes = nounsing.rhymes(wordA);
  if (perfectRhymes.includes(wordB)) {
    types.push('perfect');
    types.push(...structuralRhymeTypes(wordB));
    const result = unique(types);
    setBoundedCache(classifyCache, key, result, MAX_CLASSIFY_CACHE_SIZE);
    return result;
  }

  // Medium-speed checks — ordered by typical speed (fastest first)
  const mediumChecks: [RhymeType, (w: string) => string[]][] = [
    ['eye', eyeRhyme],
    ['family', familyRhyme],
    ['slant', (w) => slantRhyme(w)],
    ['assonant', (w) => assonantRhyme(w)],
    ['consonant', (w) => consonantRhyme(w)],
    ['grammatical', grammaticalRhyme],
    ['syllabic', (w) => syllabicRhyme(w)],
    ['augmented', (w) => augmentedRhyme(w)],
    ['diminished', (w) => diminishedRhyme(w)],
    ['trailing', trailingRhyme],
    ['apocopated', apocopatedRhyme],
    ['unstressed', (w) => unstressedRhyme(w)],
  ];

  for (const [type, fn] of mediumChecks) {
    if (fn(wordA).includes(wordB)) {
      types.push(type);
    }
  }

  // Slower checks
  if (lightRhyme(wordA).includes(wordB)) {
    types.push('light');
  }
  if (wrenchedRhyme(wordA).includes(wordB)) {
    types.push('wrenched');
  }

  // Mosaic is extremely slow; only check when explicitly requested
  if (mosaicFlag && mosaicRhyme(wordA).includes(wordB)) {
    types.push('mosaic');
  }

  const result = unique(types);
  setBoundedCache(classifyCache, key, result, MAX_CLASSIFY_CACHE_SIZE);
  return result;
}

// ============================================================================
// Pool hygiene helpers — prevent exact-word repetition & phonetic cross-contamination
// ============================================================================

/**
 * Filters a candidate pool, removing any words whose rhyming part matches
 * the rhyming part of any word in `forbiddenWords`.
 *
 * Use this when assembling multiple rhyme-family pools to guarantee
 * phonetic distinctness between families (cross-contamination prevention).
 */
export function filterByForbiddenRhymingParts(words: string[], forbiddenWords: string[]): string[] {
  const forbiddenParts = new Set<string>();
  for (const fw of forbiddenWords) {
    const phones = firstPhonesForWord(fw);
    if (phones) {
      forbiddenParts.add(nounsing.rhymingPart(phones));
    }
  }
  return words.filter(w => {
    const phones = firstPhonesForWord(w);
    if (!phones) return true;
    const rp = nounsing.rhymingPart(phones);
    return !forbiddenParts.has(rp);
  });
}

/**
 * Deduplicates an array of rhyme pools so that a given word appears in
 * at most one pool. Earlier pools take precedence.
 *
 * Use this after assembling multiple rhyme-family pools to prevent the
 * exact same end-word from being offered for two different rhyme slots.
 */
export function deduplicatePools(pools: string[][]): string[][] {
  const seen = new Set<string>();
  return pools.map(pool => {
    const filtered: string[] = [];
    for (const w of pool) {
      if (seen.has(w)) continue;
      seen.add(w);
      filtered.push(w);
    }
    return filtered;
  });
}

/**
 * Returns a random rhyme of any supported type.
 * Prioritises fast-computing types so the call returns in milliseconds
 * rather than minutes (mosaic/wrenched can take 10s+).
 */
export function randomRhyme(word: string, phones?: string): { word: string; type: RhymeType } | null {
  const fastTypes: RhymeType[] = [
    'perfect', 'masculine', 'feminine', 'dactylic',
    'slant', 'assonant', 'consonant', 'rich',
    'trailing', 'apocopated', 'unstressed',
    'augmented', 'diminished', 'syllabic', 'family',
  ];
  shuffleInPlace(fastTypes);

  for (const type of fastTypes) {
    const rhymes = getRhymes(word, type, phones);
    if (rhymes.length > 0) {
      const idx = Math.floor(Math.random() * rhymes.length);
      return { word: rhymes[idx], type };
    }
  }

  // Slow fallback types — only reached when fast types yield nothing
  const slowTypes: RhymeType[] = ['eye', 'grammatical', 'light', 'wrenched', 'mosaic'];
  shuffleInPlace(slowTypes);

  for (const type of slowTypes) {
    const rhymes = getRhymes(word, type, phones);
    if (rhymes.length > 0) {
      const idx = Math.floor(Math.random() * rhymes.length);
      return { word: rhymes[idx], type };
    }
  }

  // Identical rhyme is always available as a last resort
  return { word, type: 'identical' };
}

// ============================================================================
// Legacy / utility functions (kept for compatibility)
// ============================================================================

/**
 * Returns words that have assonance with the input word.
 */
export function assonance(
  word: string,
  phones?: string,
  searchDirection: SearchDirection = null,
  matchLimit: number | null = null
): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  let phonesList = resolvedPhones.split(' ');
  if (searchDirection === 'backward') {
    phonesList = [...phonesList].reverse();
  }

  const searchList: string[] = [];
  let matchCnt = 0;

  for (const phone of phonesList) {
    if (isConsonant(phone)) {
      searchList.push('.');
    } else if (isVowel(phone)) {
      searchList.push(phone);
      matchCnt += 1;
      if (matchLimit !== null && matchCnt === matchLimit) break;
    }
  }

  let search: string;
  if (searchDirection === 'backward') {
    search = [...searchList].reverse().join(' ') + '$';
  } else if (searchDirection === 'forward') {
    search = '^' + searchList.join(' ');
  } else {
    search = searchList.join(' ');
  }

  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * Returns words that have consonance with the input word.
 */
export function consonance(
  word: string,
  phones?: string,
  searchDirection: SearchDirection = null,
  matchLimit: number | null = null
): string[] {
  const resolvedPhones = resolvePhones(word, phones);
  if (!resolvedPhones) return [];

  let phonesList = resolvedPhones.split(' ');
  if (searchDirection === 'backward') {
    phonesList = [...phonesList].reverse();
  }

  const searchList: string[] = [];
  let matchCnt = 0;

  for (const phone of phonesList) {
    if (isVowel(phone)) {
      searchList.push('.{1,3}');
    } else if (isConsonant(phone)) {
      searchList.push(phone);
      matchCnt += 1;
      if (matchLimit !== null && matchCnt === matchLimit) break;
    }
  }

  let search: string;
  if (searchDirection === 'backward') {
    search = [...searchList].reverse().join(' ') + '$';
  } else if (searchDirection === 'forward') {
    search = '^' + searchList.join(' ');
  } else {
    search = searchList.join(' ');
  }

  let rhymes = nounsing.search(search);
  rhymes = unique(rhymes);
  rhymes = rhymes.filter((r) => r !== word);
  return rhymes;
}

/**
 * Returns words that alliterate with the input word.
 */
export function alliteration(word: string): string[] {
  return consonance(word, undefined, 'forward', 1);
}

/**
 * Returns a rhyme whose stress pattern matches the input word's stress.
 */
export function rhymeSameStress(word: string): string | null {
  let timeoutTimer = 0;

  while (true) {
    const phones = nounsing.phonesForWord(word);
    if (!phones || phones.length === 0) return null;
    const phone = phones[Math.floor(Math.random() * phones.length)];
    const wordStress = nounsing.stresses(phone);
    const rhyme = randomRhyme(word);
    if (!rhyme) return null;

    const rhymePhones = nounsing.phonesForWord(rhyme.word);
    for (const rp of rhymePhones) {
      const rhymeStress = nounsing.stresses(rp);
      if (wordStress === rhymeStress) {
        return rhyme.word;
      }
    }

    if (timeoutTimer === 10) {
      return rhyme.word;
    }
    timeoutTimer += 1;
  }
}

// ============================================================================
// Regex / wildcard helpers
// ============================================================================

/**
 * Generates all combinations of regex strings where each phoneme in `phones`
 * is optionally replaced with a wildcard ('.{1,3}').
 */
export function wildcardMixPhonesRegexSearches(
  phones: string,
  stress = false
): string[] {
  const phonesList = phones.split(' ');
  const productFactors: string[][] = [];

  for (const phone of phonesList) {
    const flist: string[] = ['.{1,3}'];
    if (!stress && isVowel(phone)) {
      flist.push(vowelBase(phone) + '.'); // ignore stress
    } else {
      flist.push(phone);
    }
    productFactors.push(flist);
  }

  const combos = cartesianProduct(productFactors);
  // Remove the all-wildcard case (content comparison, not reference)
  const filtered = combos.filter((c) => !c.every(p => p === '.{1,3}'));

  return filtered.map((item) => item.join(' '));
}

/** Cartesian product of arrays. */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
    [[]]
  );
}

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Resolves the phones string for a word, handling optional override
 * and validation.
 */
function resolvePhones(word: string, phones?: string): string {
  if (phones === undefined) {
    const p = firstPhonesForWord(word);
    if (p === '') {
      return '';
    }
    return p;
  } else {
    const allPhones = nounsing.phonesForWord(word);
    if (!allPhones || !allPhones.includes(phones)) {
      return '';
    }
    return phones;
  }
}