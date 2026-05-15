import { WordProfile, WeightMetrics } from './types';

export * from './types';

export type Pronunciation = [string, string];

// 1. Flat array for backward compatibility with legacy search/rhyme functions
export const pronunciations: Pronunciation[] = [];

// 2. Deep dictionary for augmented data
// We store an array of phones and an array of WordProfiles to handle polyphonetic variants
export const dictData: Record<string, { phones: string[]; profiles: WordProfile[] }> = {};

/**
 * Parses the 54-column CMU TSV. 
 * Populates both the flat 'pronunciations' array and the deep 'dictData' map.
 */
export function parseCMU(str: string): Pronunciation[] {
  const lines = str.split('\n');
  if (lines.length === 0) return pronunciations;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) continue;

    const parts = line.split('\t');
    if (parts.length < 2) continue;

    const word = parts[0].toLowerCase();
    const phones = parts[1]; // The space-separated phones column

    // Preserve original behavior: push to the flat array
    pronunciations.push([word, phones]);

    // Build the comprehensive WordProfile object
    const wordProfile: WordProfile = {
      spelling: word,
      phonology: {
        phones: phones,
        stressTrans: parts[2] || '',
        syllStruct: parts[3] || '',
        syllabification: parts[4] || '',
        vowelLength: parts[18] || '',
        codaLength: parseInt(parts[31], 10) || 0,
        nsylls: parseInt(parts[34], 10) || 0
      },
      stress: {
        stressTrans: parts[2],
        mainStress: parts[5],
        finalStress: parts[6],
        penultStress: parts[7],
        apStress: parts[8],
        papStress: parts[9],
        leftEdgeStress: parts[35],
        initStress: parts[36],
        singleStress: parts[37],
        final3stressTrans: parts[51]
      },
      weight: [
        {
          syllable: 'final',
          onset: parts[19],
          vowel: parts[44],
          coda: parts[45],
          heaviness: parts[46],
          weight: parts[10]
        },
        {
          syllable: 'penult',
          onset: parts[20],
          vowel: parts[38],
          coda: parts[39],
          heaviness: parts[42],
          weight: parts[12]
        },
        {
          syllable: 'antepenult',
          onset: parts[21],
          vowel: parts[47],
          coda: parts[48],
          heaviness: parts[49],
          weight: parts[14]
        },
        {
          syllable: 'preantepenult',
          onset: 'NA',
          vowel: 'NA',
          coda: 'NA',
          heaviness: parts[17],
          weight: parts[16]
        }
      ],
      morphology: {
        morphology: parts[25],
        suffixType: parts[26],
        prefixType: parts[27],
        prefix: parts[28],
        suffix: parts[29],
        pos: parts[33]
      },
      weightPattern: parts[50],
      finalV: parts[22],
      finalC: parts[23],
      S: parts[24],
      freq: parts[32],
      penultPossibleCoda: parts[40],
      finalComplexOnset: parts[41],
      finalTwoV: parts[43],
      coda: parts[30]
    };

    // Inject into dictData, handling polyphonetic variants
    if (!Object.hasOwn(dictData, word)) {
      dictData[word] = {
        phones: [phones],
        profiles: [wordProfile]
      };
    } else {
      dictData[word].phones.push(phones);
      dictData[word].profiles.push(wordProfile);
    }
  }
  return pronunciations;
}

// Execute synchronously on startup using the new TSV
const tsvRaw = require('fs').readFileSync(__dirname + '/newerCMU.tsv', 'utf8');
parseCMU(tsvRaw);

export function syllableCount(phones: string | string[]): number {
  const items = Array.isArray(phones) ? phones : Array.from(phones);
  return items.reduce((sum, item) => sum + (item.match(/[012]/g) || []).length, 0);
}

export function phonesForWord(find: string): string[] {
  const entry = dictData[find.toLowerCase()];
  if (entry) return entry.phones;
  const phones: string[] = [];
  for (const [word, phoneStr] of pronunciations) {
    if (word === find.toLowerCase()) {
      phones.push(phoneStr);
    }
  }
  return phones;
}

export function rhymingPart(phones: string): string {
  const phonesList = phones.split(' ');
  let idx = 0;
  for (let i = phonesList.length - 1; i >= 0; i--) {
    if (/[12]$/.test(phonesList[i])) {
      idx = i;
      break;
    }
  }
  return phonesList.slice(idx).join(' ');
}

export function search(pattern: string | RegExp): string[] {
  const matches: string[] = [];
  const re = pattern instanceof RegExp ? pattern : new RegExp('\\b' + pattern + '\\b');
  for (const [word, phones] of pronunciations) {
    if (re.test(phones)) {
      matches.push(word);
    }
  }
  return matches;
}

export function searchStresses(pattern: string): string[] {
  const matches: string[] = [];
  const re = new RegExp('\\b' + pattern + '\\b');
  for (const [word, phones] of pronunciations) {
    if (re.test(stresses(phones))) {
      matches.push(word);
    }
  }
  return matches;
}

export function rhymes(word: string): string[] {
  const allRhymes: string[] = [];
  const allPhones = phonesForWord(word);
  for (const phonesStr of allPhones) {
    const part = rhymingPart(phonesStr);
    const found = search(part + '$');
    allRhymes.push(...found);
  }
  return allRhymes.filter(r => r !== word);
}

export function stresses(s: string): string {
  return s.replace(/[^012]/g, '');
}


// ============================================================================
// 1. DOMAIN-SEGMENTED DATA ACCESSORS (Covering 50+ augmented CMU columns)
// ============================================================================

function getEntry(word: string): WordProfile[] | null {
  const entry = dictData[word.toLowerCase()];
  return entry?.profiles && entry.profiles.length > 0 ? entry.profiles : null;
}

/** 1. Lexical metadata */
export function lexicon(word: string) {
  return getEntry(word)?.map(d => ({
    spelling: d.spelling,
    freq: d.freq,
    pos: d.morphology.pos,
    nsylls: d.phonology.nsylls
  })) || null;
}

/** 2. Phonemic & Syllabic representation */
export function phonemics(word: string) {
  return getEntry(word)?.map(d => ({
    phones: d.phonology.phones,
    syllStruct: d.phonology.syllStruct,
    syllabification: d.phonology.syllabification,
    vowelLength: d.phonology.vowelLength
  })) || null;
}

/** 3. Stress contour mapping */
export function stress(word: string) {
  return getEntry(word)?.map(d => d.stress) || null;
}

/** 4. Syllabic weight topologies */
export function weights(word: string) {
  return getEntry(word)?.map(d => {
    const fullPattern = d.weightPattern.split(' ').filter((x: string) => x === 'H' || x === 'L');
    const nsylls = d.phonology.nsylls;
    return {
      pattern: nsylls > 0 ? fullPattern.slice(-nsylls) : fullPattern,
      details: d.weight
    };
  }) || null;
}

/** 5. Vowels & Nuclei */
export function vowels(word: string) {
  return getEntry(word)?.map(d => ({
    finalV: d.finalV,
    finalTwoV: d.finalTwoV,
    types: {
      final: d.weight.find((w: WeightMetrics) => w.syllable === 'final')?.vowel || 'NA',
      penult: d.weight.find((w: WeightMetrics) => w.syllable === 'penult')?.vowel || 'NA',
      antepenult: d.weight.find((w: WeightMetrics) => w.syllable === 'antepenult')?.vowel || 'NA'
    }
  })) || null;
}

/** 6. Onset & Coda geometry */
export function edges(word: string) {
  return getEntry(word)?.map(d => ({
    finalC: d.finalC,
    finalComplexOnset: d.finalComplexOnset,
    codaLength: d.phonology.codaLength,
    penultPossibleCoda: d.penultPossibleCoda,
    coda: d.coda
  })) || null;
}

/** 7. Morpho-phonological Dynamics */
export function morphology(word: string) {
  return getEntry(word)?.map(d => ({
    morphology: d.morphology.morphology,
    suffixType: d.morphology.suffixType,
    prefixType: d.morphology.prefixType,
    prefix: d.morphology.prefix,
    suffix: d.morphology.suffix,
    extrametricalS: d.S
  })) || null;
}

/** 8. The God-Object (All metadata combined) */
export function all(word: string) {
  return getEntry(word);
}


// ============================================================================
// 2. TOP 10 COMPLEX NLP & POETICS USE CASES
// ============================================================================

/**
 * 1. rhymeProfile: Extracts the exact rhyming phonemes, heavy/light rime nature, and detects extrametrical codas.
 */
export function rhymeProfile(word: string) {
  const allData = all(word);
  if (!allData) return null;
  return allData.map(d => {
    const phones = d.phonology.phones;
    const rPart = rhymingPart(phones);
    return {
      rhymingPhones: rPart,
      weight: d.weightPattern.split(' ').pop() || 'NA',
      hasExtrametricalS: d.S !== 'other' && d.S !== 'NA',
      codaComplexity: d.finalC
    };
  });
}

/**
 * 2. rhymeBySyllables: Finds perfect rhymes that also strictly match a given syllable count.
 */
export function rhymeBySyllables(word: string, count: number): string[] {
  const basicRhymes = rhymes(word);
  return basicRhymes.filter(r => {
    const lex = lexicon(r);
    return lex && lex.some(l => l.nsylls === count);
  });
}

/**
 * 3. meterMatch: Finds words matching an exact metrical sequence (e.g. "01" for an iamb).
 */
export function meterMatch(pattern: string): string[] {
  return searchStresses(`^${pattern}$`);
}

/**
 * 4. scansion: Translates numeric stress/weight into traditional poetic scansion terms.
 */
export function scansion(word: string) {
  const s = stress(word);
  if (!s) return null;

  return s.map(st => {
    const c = st.stressTrans;
    let label = 'complex/irregular';

    // Disyllabic 
    if (/^01$|^02$/.test(c)) label = 'iambic';
    else if (/^10$|^20$/.test(c)) label = 'trochaic'; 
    else if (/^1[12]$|^21$/.test(c)) label = 'spondaic';
    else if (/^00$/.test(c)) label = 'pyrrhic';

    // Trisyllabic
    else if (/^100$|^1[02]0$|^[12]02$/.test(c)) label = 'dactylic';
    else if (/^00[12]$|^02[12]$/.test(c)) label = 'anapestic';
    else if (/^010$|^020$/.test(c)) label = 'amphibrachic';
    else if (/^01[12]$|^021$/.test(c)) label = 'bacchic';
    else if (/^[12][12]0$/.test(c)) label = 'antibacchic';
    else if (/^[12]0[12]$/.test(c)) label = 'cretic';

    // Tetrasyllabic
    else if (/^1001$|^[12]00[12]$/.test(c)) label = 'choriambic';
    else if (/^0110$|^0[12][12]0$/.test(c)) label = 'antispastic';
    else if (/^0010$|^0[02][12]0$/.test(c)) label = 'third paeon';
    else if (/^1000$|^[12]000$/.test(c)) label = 'first paeon';
    else if (/^0100$|^0[12]00$/.test(c)) label = 'second paeon';
    else if (/^0001$|^000[12]$/.test(c)) label = 'fourth paeon';

    return { contour: c, label, weightPattern: st.final3stressTrans };
  });
}

/**
 * 5. onsetParse: Details Maximal Onset Principle applied to the word. Highlights blocked boundaries.
 */
export function onsetParse(word: string) {
  const p = phonemics(word);
  const w = weights(word);
  if (!p || !w) return null;
  return p.map((ph, i) => {
    return {
      syllabification: ph.syllabification,
      cvStructure: ph.syllStruct,
      isPenultClosed: w[i].details.find((d: WeightMetrics) => d.syllable === 'penult')?.coda === 'closed'
    };
  });
}

/**
 * 6. suffixShiftPotential: Evaluates if adding a suffix to this word forces a stress shift.
 */
export function suffixShiftPotential(word: string) {
  const m = morphology(word);
  const w = weights(word);
  const e = edges(word);
  if (!m || !w || !e) return null;
  return m.map((mo, i) => {
    const penultWeight = w[i].details.find((d: WeightMetrics) => d.syllable === 'penult')?.heaviness;
    const shiftLikely = penultWeight === 'H' || e[i].penultPossibleCoda !== 'noCoda';
    return {
      currentSuffix: mo.suffix,
      suffixType: mo.suffixType,
      shiftLikely: shiftLikely
    };
  });
}

/**
 * 7. extrametricals: Maps morphological edge conditions (like plural 's') that violate syllable weight rules.
 */
export function extrametricals(word: string) {
  const m = morphology(word);
  const e = edges(word);
  if (!m || !e) return null;
  return m.map((mo, i) => ({
    S_classifier: mo.extrametricalS,
    codaLength: e[i].codaLength,
    finalComplexOnset: e[i].finalComplexOnset,
    isIrregular: (mo.extrametricalS === 'S' || mo.extrametricalS === 'SCluster'),
    status: (mo.extrametricalS === 'S' || mo.extrametricalS === 'SCluster') ? 'Detected' : 'None'
  }));
}

/**
 * 8. vowelQualities: Statistical analysis of vowels (Diphthongs vs Monophthongs) across the word.
 */
export function vowelQualities(word: string) {
  const v = vowels(word);
  if (!v) return null;
  return v.map(vo => {
    const vals = Object.values(vo.types).filter(x => x !== 'NA');
    const diphthongs = vals.filter(x => x === 'D').length;
    const monophthongs = vals.filter(x => x === 'M').length;
    return {
      distribution: vo.types,
      diphthongs,
      monophthongs,
      allMonophthong: diphthongs === 0 && monophthongs > 0
    };
  });
}

export const vowelHarmony = vowelQualities;

/**
 * 9. codaComplexity: Isolates words with rare complex codas (CCC) and boundary asymmetries.
 */
export function codaComplexity(word: string) {
  const e = edges(word);
  if (!e) return null;
  return e.map(ed => ({
    complexity: ed.finalC,
    codaLength: ed.codaLength,
    phonemes: ed.coda,
    isComplex: ed.codaLength > 1 || ed.finalComplexOnset === 'complex'
  }));
}

export type PoeticMeter = 'iamb' | 'trochee' | 'spondee' | 'pyrrhic' |
  'dactyl' | 'anapest' | 'amphibrach' | 'bacchic' | 'antibacchic' | 'cretic' |
  'choriamb' | 'antispast' | 'first paeon' | 'second paeon' | 'third paeon' | 'fourth paeon';

/**
 * 10. poeticFit: Boolean indicating if an entire word organically occupies a requested foot placement.
 * Uses strict boundaries to ensure the word is a holistic match for the meter.
 */
export function poeticFit(word: string, footType: PoeticMeter): boolean {
  const scan = scansion(word);
  if (!scan) return false;

  return scan.some(s => {
    const c = s.contour;

    switch (footType) {
      // Disyllabic
      case 'iamb': return /^01$|^02$/.test(c);
      case 'trochee': return /^10$|^20$/.test(c);
      case 'spondee': return /^1[12]$|^21$/.test(c);
      case 'pyrrhic': return /^00$/.test(c);

      // Trisyllabic
      case 'dactyl': return /^100$|^1[02]0$|^[12]02$/.test(c);
      case 'anapest': return /^00[12]$|^02[12]$/.test(c);
      case 'amphibrach': return /^010$|^020$/.test(c);
      case 'bacchic': return /^01[12]$|^021$/.test(c);
      case 'antibacchic': return /^[12][12]0$/.test(c);
      case 'cretic': return /^[12]0[12]$/.test(c);

      // Tetrasyllabic
      case 'choriamb': return /^1001$|^[12]00[12]$/.test(c);
      case 'antispast': return /^0110$|^0[12][12]0$/.test(c);
      case 'first paeon': return /^1000$|^[12]000$/.test(c);
      case 'second paeon': return /^0100$|^0[12]00$/.test(c);
      case 'third paeon': return /^0010$|^0[02][12]0$/.test(c);
      case 'fourth paeon': return /^0001$|^000[12]$/.test(c);

      default: return false;
    }
  });
}

export type MetricalInset = { syll: string; stress: string };

/**
 * 16. metricalInsets: Finds all inset metrical feet within a word and maps them to phonetic syllables.
 * Each entry carries the stress digit (0/1/2) of its corresponding syllable for display color-coding.
 */
export function metricalInsets(word: string): Record<string, MetricalInset[][]> | null {
  const ph = phonemics(word)?.[0];
  if (!ph) return null;

  const contour = stresses(ph.phones);
  const sylls = ph.syllabification.match(/\([^)]+\)/g) || [];

  if (contour.length !== sylls.length) return null;

  const feet: Record<string, { size: number; re: RegExp }> = {
    iamb: { size: 2, re: /^01$|^02$/ },
    trochee: { size: 2, re: /^10$|^20$/ },
    spondee: { size: 2, re: /^1[12]$|^21$/ },
    pyrrhic: { size: 2, re: /^00$/ },
    dactyl: { size: 3, re: /^100$|^1[02]0$|^[12]02$/ },
    anapest: { size: 3, re: /^00[12]$|^02[12]$/ },
    amphibrach: { size: 3, re: /^010$|^020$/ },
    bacchic: { size: 3, re: /^01[12]$|^021$/ },
    cretic: { size: 3, re: /^[12]0[12]$/ },
    antibacchic: { size: 3, re: /^[12][12]0$/ },
    choriamb: { size: 4, re: /^1001$|^[12]00[12]$/ },
    antispast: { size: 4, re: /^0110$|^0[12][12]0$/ },
    'first paeon': { size: 4, re: /^1000$|^[12]000$/ },
    'second paeon': { size: 4, re: /^0100$|^0[12]00$/ },
    'third paeon': { size: 4, re: /^0010$|^0[02][12]0$/ },
    'fourth paeon': { size: 4, re: /^0001$|^000[12]$/ }
  };

  const results: Record<string, MetricalInset[][]> = {};

  for (const [footName, def] of Object.entries(feet)) {
    results[footName] = [];
    for (let i = 0; i <= contour.length - def.size; i++) {
      const slice = contour.substring(i, i + def.size);
      if (def.re.test(slice)) {
        const entries: MetricalInset[] = [];
        for (let j = 0; j < def.size; j++) {
          entries.push({ syll: sylls[i + j], stress: contour[i + j] });
        }
        results[footName].push(entries);
      }
    }
  }

  return results;
}

/**
 * Filters an array of candidate words against a target word's Penn Treebank POS tag,
 * sliced by a precision depth (1-3). Precision 0 disables filtering.
 */
function filterByPOS(targetWord: string, candidates: string[], precision?: number): string[] {
  if (!precision || precision < 1 || precision > 3) return candidates;

  const targetLex = lexicon(targetWord);
  if (!targetLex || targetLex.length === 0) return candidates;

  const targetPos = targetLex[0].pos;
  if (!targetPos || targetPos === 'NA') return candidates;

  const targetPrefix = targetPos.substring(0, precision).toUpperCase();

  return candidates.filter(candidate => {
    const candidateLex = lexicon(candidate);
    if (!candidateLex || candidateLex.length === 0) return false;
    const candidatePos = candidateLex[0].pos;
    return candidatePos && candidatePos !== 'NA' && candidatePos.substring(0, precision).toUpperCase() === targetPrefix;
  });
}

/**
 * Filters candidates to only those whose Zipf frequency is >= threshold.
 * Threshold < 1.00 disables the filter entirely (allowing NA values through).
 */
function filterByFreq(candidates: string[], threshold?: number): string[] {
  if (threshold === undefined || threshold < 1.0) return candidates;

  return candidates.filter(candidate => {
    const candidateLex = lexicon(candidate);
    if (!candidateLex || candidateLex.length === 0) return false;
    const f = parseFloat(candidateLex[0].freq);
    return !isNaN(f) && f >= threshold;
  });
}

export function mostCommonPhones(text: string, topN: number = 5): [string, number][] {
  const counts: Record<string, number> = {};
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const pronunciationList = phonesForWord(word.replace(/[^a-z']/g, ''));
    if (pronunciationList.length > 0) {
      const phones = pronunciationList[0].split(" ");
      for (const phone of phones) {
        counts[phone] = (counts[phone] || 0) + 1;
      }
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN);
}

export function countTextSyllables(text: string): { syllables: number; phonemes: number } {
  const words = text.toLowerCase().split(/\s+/);
  let syllables = 0;
  let phonemes = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z']/g, '');
    const lex = lexicon(cleanWord);
    const phones = phonesForWord(cleanWord);
    if (lex && lex.length > 0 && lex[0].nsylls) {
      syllables += lex[0].nsylls;
    } else if (phones.length > 0) {
      syllables += syllableCount(phones[0]);
    }
    if (phones.length > 0) {
      phonemes += phones[0].split(" ").length;
    }
  }
  return { syllables, phonemes };
}

export function rewriteFromFirstTwoPhones(text: string, posPrecision?: number, freqThreshold?: number): string {
  const out: string[] = [];
  text.toLowerCase().split(/\s+/).forEach((word) => {
    const cleanWord = word.replace(/[^a-z']/g, '');
    const phones = phonesForWord(cleanWord);
    if (phones.length > 0) {
      const first2 = phones[0].split(" ").slice(0, 2).join(" ");
      let matches = search("^" + first2);
      if (posPrecision && posPrecision >= 1 && posPrecision <= 3 && matches.length > 0) {
        matches = filterByPOS(cleanWord, matches, posPrecision);
      }
      if (freqThreshold !== undefined && freqThreshold >= 1.0 && matches.length > 0) {
        matches = filterByFreq(matches, freqThreshold);
      }
      out.push(matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : word);
    } else {
      out.push(word);
    }
  });
  return out.join(" ");
}

export function rewriteWithStressPattern(text: string, posPrecision?: number, freqThreshold?: number): string {
  const out: string[] = [];
  text.toLowerCase().split(/\s+/).forEach((word) => {
    const cleanWord = word.replace(/[^a-z']/g, '');
    const pronunciations = phonesForWord(cleanWord);
    if (pronunciations.length > 0) {
      const pat = stresses(pronunciations[0]);
      let matches = searchStresses("^" + pat + "$");
      if (posPrecision && posPrecision >= 1 && posPrecision <= 3 && matches.length > 0) {
        matches = filterByPOS(cleanWord, matches, posPrecision);
      }
      if (freqThreshold !== undefined && freqThreshold >= 1.0 && matches.length > 0) {
        matches = filterByFreq(matches, freqThreshold);
      }
      out.push(matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : word);
    } else {
      out.push(word);
    }
  });
  return out.join(" ");
}

export function rewriteWithRhymes(text: string, posPrecision?: number, freqThreshold?: number): string {
  const out: string[] = [];
  text.toLowerCase().split(/\s+/).forEach((word) => {
    const cleanWord = word.replace(/[^a-z']/g, '');
    let r = rhymes(cleanWord);
    if (posPrecision && posPrecision >= 1 && posPrecision <= 3 && r.length > 0) {
      r = filterByPOS(cleanWord, r, posPrecision);
    }
    if (freqThreshold !== undefined && freqThreshold >= 1.0 && r.length > 0) {
      r = filterByFreq(r, freqThreshold);
    }
    out.push(r.length > 0 ? r[Math.floor(Math.random() * r.length)] : word);
  });
  return out.join(" ");
}

