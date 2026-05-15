export interface WeightMetrics {
  syllable: "final" | "penult" | "antepenult" | "preantepenult";
  onset: string;
  vowel: string;
  coda: string;
  heaviness: string; // H/L
  weight: string; // -V, -LC etc.
}

export interface PhonologyData {
  phones: string;
  stressTrans: string;
  syllStruct: string;
  syllabification: string;
  vowelLength: string;
  nsylls: number;
  codaLength: number;
}

export interface StressData {
  stressTrans: string;
  mainStress: string;
  finalStress: string;
  penultStress: string;
  apStress: string;
  papStress: string;
  leftEdgeStress: string;
  initStress: string;
  singleStress: string;
  final3stressTrans: string;
}

export interface MorphologyData {
  morphology: string; // simple/complex
  pos: string;
  suffixType: string;
  prefixType: string;
  prefix: string;
  suffix: string;
}

export interface WordProfile {
  spelling: string;
  phonology: PhonologyData;
  weight: WeightMetrics[];
  stress: StressData;
  morphology: MorphologyData;
  weightPattern: string;
  finalV: string;
  finalC: string;
  S: string;
  freq: string;
  penultPossibleCoda: string;
  finalComplexOnset: string;
  finalTwoV: string;
  coda: string;
}
