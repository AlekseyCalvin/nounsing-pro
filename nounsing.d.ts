import { WordProfile, WeightMetrics } from './types';
export * from './types';
export type Pronunciation = [string, string];
export declare const pronunciations: Pronunciation[];
export declare const dictData: Record<string, {
    phones: string[];
    profiles: WordProfile[];
}>;
/**
 * Parses the 54-column CMU TSV.
 * Populates both the flat 'pronunciations' array and the deep 'dictData' map.
 */
export declare function parseCMU(str: string): Pronunciation[];
export declare function syllableCount(phones: string | string[]): number;
export declare function phonesForWord(find: string): string[];
export declare function rhymingPart(phones: string): string;
export declare function search(pattern: string | RegExp): string[];
export declare function searchStresses(pattern: string): string[];
export declare function rhymes(word: string): string[];
export declare function stresses(s: string): string;
/** 1. Lexical metadata */
export declare function lexicon(word: string): {
    spelling: string;
    freq: string;
    pos: string;
    nsylls: number;
}[] | null;
/** 2. Phonemic & Syllabic representation */
export declare function phonemics(word: string): {
    phones: string;
    syllStruct: string;
    syllabification: string;
    vowelLength: string;
}[] | null;
/** 3. Stress contour mapping */
export declare function stress(word: string): import("./types").StressData[] | null;
/** 4. Syllabic weight topologies */
export declare function weights(word: string): {
    pattern: ("H" | "L")[];
    details: WeightMetrics[];
}[] | null;
/** 5. Vowels & Nuclei */
export declare function vowels(word: string): {
    finalV: string;
    finalTwoV: string;
    types: {
        final: string;
        penult: string;
        antepenult: string;
    };
}[] | null;
/** 6. Onset & Coda geometry */
export declare function edges(word: string): {
    finalC: string;
    finalComplexOnset: string;
    codaLength: number;
    penultPossibleCoda: string;
    coda: string;
}[] | null;
/** 7. Morpho-phonological Dynamics */
export declare function morphology(word: string): {
    morphology: string;
    suffixType: string;
    prefixType: string;
    prefix: string;
    suffix: string;
    extrametricalS: string;
}[] | null;
/** 8. The God-Object (All metadata combined) */
export declare function all(word: string): WordProfile[] | null;
/**
 * 1. rhymeProfile: Extracts the exact rhyming phonemes, heavy/light rime nature, and detects extrametrical codas.
 */
export declare function rhymeProfile(word: string): {
    rhymingPhones: string;
    weight: string;
    hasExtrametricalS: boolean;
    codaComplexity: string;
}[] | null;
/**
 * 2. rhymeBySyllables: Finds perfect rhymes that also strictly match a given syllable count.
 */
export declare function rhymeBySyllables(word: string, count: number): string[];
/**
 * 3. meterMatch: Finds words matching an exact metrical sequence (e.g. "01" for an iamb).
 */
export declare function meterMatch(pattern: string): string[];
/**
 * 4. scansion: Translates numeric stress/weight into traditional poetic scansion terms.
 */
export declare function scansion(word: string): {
    contour: string;
    label: string;
    weightPattern: string;
}[] | null;
/**
 * 5. onsetParse: Details Maximal Onset Principle applied to the word. Highlights blocked boundaries.
 */
export declare function onsetParse(word: string): {
    syllabification: string;
    cvStructure: string;
    isPenultClosed: boolean;
}[] | null;
/**
 * 6. suffixShiftPotential: Evaluates if adding a suffix to this word forces a stress shift.
 */
export declare function suffixShiftPotential(word: string): {
    currentSuffix: string;
    suffixType: string;
    shiftLikely: boolean;
}[] | null;
/**
 * 7. extrametricals: Maps morphological edge conditions (like plural 's') that violate syllable weight rules.
 */
export declare function extrametricals(word: string): {
    S_classifier: string;
    codaLength: number;
    finalComplexOnset: string;
    isIrregular: boolean;
    status: string;
}[] | null;
/**
 * 8. vowelQualities: Statistical analysis of vowels (Diphthongs vs Monophthongs) across the word.
 */
export declare function vowelQualities(word: string): {
    distribution: {
        final: string;
        penult: string;
        antepenult: string;
    };
    diphthongs: number;
    monophthongs: number;
    allMonophthong: boolean;
}[] | null;
export declare const vowelHarmony: typeof vowelQualities;
/**
 * 9. codaComplexity: Isolates words with rare complex codas (CCC) and boundary asymmetries.
 */
export declare function codaComplexity(word: string): {
    complexity: string;
    codaLength: number;
    phonemes: string;
    isComplex: boolean;
}[] | null;
export type PoeticMeter = 'iamb' | 'trochee' | 'spondee' | 'pyrrhic' | 'dactyl' | 'anapest' | 'amphibrach' | 'bacchic' | 'antibacchic' | 'cretic' | 'choriamb' | 'antispast' | 'first paeon' | 'second paeon' | 'third paeon' | 'fourth paeon';
/**
 * 10. poeticFit: Boolean indicating if an entire word organically occupies a requested foot placement.
 * Uses strict boundaries to ensure the word is a holistic match for the meter.
 */
export declare function poeticFit(word: string, footType: PoeticMeter): boolean;
export type MetricalInset = {
    syll: string;
    stress: string;
};
/**
 * 16. metricalInsets: Finds all inset metrical feet within a word and maps them to phonetic syllables.
 * Each entry carries the stress digit (0/1/2) of its corresponding syllable for display color-coding.
 */
export declare function metricalInsets(word: string): Record<string, MetricalInset[][]> | null;
export declare function mostCommonPhones(text: string, topN?: number): [string, number][];
export declare function countTextSyllables(text: string): {
    syllables: number;
    phonemes: number;
};
export declare function rewriteFromFirstTwoPhones(text: string, posPrecision?: number, freqThreshold?: number): string;
export declare function rewriteWithStressPattern(text: string, posPrecision?: number, freqThreshold?: number): string;
export declare function rewriteWithRhymes(text: string, posPrecision?: number, freqThreshold?: number): string;
//# sourceMappingURL=nounsing.d.ts.map