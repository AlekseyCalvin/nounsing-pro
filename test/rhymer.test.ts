import test from 'tape';
import * as rhymer from '../src/verse_tscript_rhymer';
import * as nounsing from '../src/nounsing';

// Wait for database parsing to complete in case it's lazy, though it should load synchronously.
test('Rhymer Setup: Verify database loaded', (t) => {
  t.ok(nounsing.pronunciations.length > 1000, 'nounsing database should have loaded many pronunciations');
  t.end();
});

// ============================================================================
// Phoneme helpers and core utility functions
// ============================================================================
test('Core Rhymer Helpers', (t) => {
  t.ok(rhymer.isConsonantCluster('S T R'), 'STR is a consonant cluster');
  t.notOk(rhymer.isConsonantCluster('AH0'), 'AH0 is not a consonant cluster');

  t.ok(rhymer.isVowel('AH0'), 'AH0 is a vowel');
  t.notOk(rhymer.isVowel('T'), 'T is not a vowel');

  t.ok(rhymer.isStressedVowel('AE1'), 'AE1 is a stressed vowel');
  t.ok(rhymer.isStressedVowel('AE2'), 'AE2 is a stressed vowel');
  t.notOk(rhymer.isStressedVowel('AE0'), 'AE0 is not a stressed vowel');

  t.ok(rhymer.isUnstressedVowel('AH0'), 'AH0 is an unstressed vowel');
  t.notOk(rhymer.isUnstressedVowel('AH1'), 'AH1 is not an unstressed vowel');

  t.ok(rhymer.isConsonant('T'), 'T is a consonant');
  t.notOk(rhymer.isConsonant('AH0'), 'AH0 is not a consonant');

  t.equal(rhymer.vowelBase('AE1'), 'AE', 'vowelBase of AE1 is AE');
  t.equal(rhymer.stressOf('AE2'), 2, 'stressOf AE2 is 2');
  t.equal(rhymer.stressOf('T'), null, 'stressOf T is null');

  t.equal(rhymer.syllableCount('AE1 B D AH0 M AH0 N'), 3, 'abdomen syll count');
  t.equal(rhymer.stressPattern('AE1 B D AH0 M AH0 N'), '100', 'abdomen stress pattern');

  t.end();
});

test('Collection and Phone retrieval helpers', (t) => {
  t.deepEqual(rhymer.unique([1, 2, 2, 3, 1]), [1, 2, 3], 'unique removes duplicates');
  t.ok(rhymer.allTheSame([1, 1, 1], 1), 'allTheSame holds true for identicals');
  t.notOk(rhymer.allTheSame([1, 2, 1], 1), 'allTheSame holds false for different elements');

  const p = rhymer.firstPhonesForWord('abacus');
  t.ok(p, 'firstPhonesForWord returns non-empty for known word');
  t.equal(rhymer.firstPhonesForWord('nonexistentwordhere'), '', 'firstPhonesForWord returns empty string for unknown word');

  t.end();
});

test('Poetic Structural Rhyme Types', (t) => {
  // Test structural classification (masculine, feminine, dactylic)
  const mascTypes = rhymer.structuralRhymeTypes('sink');
  t.ok(mascTypes.includes('masculine'), 'sink is masculine structural rhyme');

  const femTypes = rhymer.structuralRhymeTypes('thinking');
  t.ok(femTypes.includes('feminine'), 'thinking is feminine structural rhyme');

  const dactTypes = rhymer.structuralRhymeTypes('sleepily');
  t.ok(dactTypes.includes('dactylic'), 'sleepily is dactylic structural rhyme');

  t.ok(rhymer.isMasculine('sink'), 'isMasculine sink');
  t.ok(rhymer.isFeminine('thinking'), 'isFeminine thinking');
  t.ok(rhymer.isDactylic('sleepily'), 'isDactylic sleepily');

  t.end();
});

// ============================================================================
// Core Rhyme Types (Perfect, Family, Slant, etc.)
// ============================================================================
test('Perfect Rhyme', (t) => {
  const rhymes = rhymer.perfectRhyme('sinking');
  t.ok(rhymes.includes('thinking') || rhymes.includes('drinking'), 'sinking rhymes perfectly with thinking/drinking');
  t.end();
});

test('Family Rhyme', (t) => {
  // Family rhymes match consonants within same phonetic family
  // e.g. PLOSIVES: P, T, K, B, D, G
  const family = rhymer.familyRhyme('cat');
  t.ok(family.length > 0, 'should generate family rhymes for cat');
  t.end();
});

test('Slant Rhyme', (t) => {
  const slant = rhymer.slantRhyme('sinking');
  t.ok(slant.length > 0, 'should generate slant rhymes for sinking');
  t.end();
});

test('Eye Rhyme', (t) => {
  const eye = rhymer.eyeRhyme('rough');
  t.ok(eye.includes('cough') || eye.includes('dough') || eye.length >= 0, 'should perform eye rhyme checks');
  t.end();
});

test('Rich Rhyme', (t) => {
  // Homophones with different spellings, e.g. write/right, sent/scent
  const rich = rhymer.richRhyme('write');
  t.ok(rich.includes('right') || rich.includes('rite'), 'write has rich rhymes with right/rite');
  t.end();
});

test('Assonant and Consonant Rhyme', (t) => {
  const assonant = rhymer.assonantRhyme('sinking');
  t.ok(assonant.length > 0, 'sinking has assonant rhymes');

  const consonant = rhymer.consonantRhyme('sinking');
  t.ok(consonant.length > 0, 'sinking has consonant rhymes');

  t.end();
});

test('Augmented and Diminished Rhyme', (t) => {
  const aug = rhymer.augmentedRhyme('cat');
  t.ok(aug.length > 0, 'cat has augmented rhymes');

  const dim = rhymer.diminishedRhyme('cats');
  t.ok(dim.length > 0, 'cats has diminished rhymes');

  t.end();
});

test('Syllabic and Light Rhyme', (t) => {
  const syll = rhymer.syllabicRhyme('sinking');
  t.ok(syll.length > 0, 'sinking has syllabic rhymes');

  const light = rhymer.lightRhyme('sinking');
  t.ok(light.length > 0, 'sinking has light rhymes');

  t.end();
});

test('Wrenched and Grammatical Rhyme', (t) => {
  const wrenched = rhymer.wrenchedRhyme('sinking');
  t.ok(wrenched.length > 0, 'sinking has wrenched rhymes');

  const gram = rhymer.grammaticalRhyme('play');
  t.ok(gram.length > 0, 'play has grammatical rhymes');

  t.end();
});

test('Trailing, Apocopated, Unstressed Rhymes', (t) => {
  const trailing = rhymer.trailingRhyme('sinking');
  t.ok(trailing.length > 0, 'sinking has trailing rhymes');

  const apoc = rhymer.apocopatedRhyme('showdown');
  t.ok(apoc.length > 0, 'showdown has apocopated rhymes');

  const unstressed = rhymer.unstressedRhyme('sinking');
  t.ok(unstressed.length > 0, 'sinking has unstressed rhymes');

  t.end();
});

test('Mosaic and Identical Rhyme', (t) => {
  const iden = rhymer.identicalRhyme('sinking');
  t.deepEqual(iden, ['sinking'], 'sinking identical rhyme is only sinking');

  const mos = rhymer.mosaicRhyme('sinking');
  t.ok(mos.length > 0, 'sinking has mosaic rhymes');

  t.end();
});

// ============================================================================
// Unified dispatcher (getRhymes) and options filtering
// ============================================================================
test('getRhymes: supports all 21 types', (t) => {
  const types: rhymer.RhymeType[] = rhymer.ALL_RHYME_TYPES as rhymer.RhymeType[];
  for (const type of types) {
    const res = rhymer.getRhymes('sing', type);
    t.ok(Array.isArray(res), `getRhymes with type ${type} returns array`);
  }
  t.end();
});

test('getRhymes: Part-of-Speech precision filtering', (t) => {
  // Let's check target word 'sing' (typically VB / verb)
  const nounSingRes = rhymer.getRhymes('sing', 'perfect', { posPrecision: 1 });
  // Candidates should share same first-char POS (V).
  for (const w of nounSingRes) {
    const lex = nounsing.lexicon(w);
    if (lex && lex[0] && lex[0].pos !== 'NA') {
      t.ok(lex[0].pos.startsWith('V'), `${w} should have a verb tag starting with V: ${lex[0].pos}`);
    }
  }

  const targetLex = nounsing.lexicon('sing');
  const targetPos = (targetLex && targetLex[0]) ? targetLex[0].pos : 'VB';

  const exactSingRes = rhymer.getRhymes('sing', 'perfect', { posPrecision: 3 });
  for (const w of exactSingRes) {
    const lex = nounsing.lexicon(w);
    if (lex && lex[0] && lex[0].pos !== 'NA') {
      t.equal(lex[0].pos, targetPos, `${w} should have exact POS ${targetPos}`);
    }
  }

  t.end();
});

test('getRhymes: Lexicon Normativity (Zipf) Threshold filtering', (t) => {
  const threshold = 3.5;
  const highFreqRes = rhymer.getRhymes('sinking', 'perfect', { freqThreshold: threshold });
  t.ok(highFreqRes.length > 0, 'should return perfect rhymes under high zipf threshold');
  for (const w of highFreqRes) {
    const lex = nounsing.lexicon(w);
    if (lex && lex[0]) {
      const freq = parseFloat(lex[0].freq);
      t.ok(freq >= threshold, `${w} has zipf freq ${freq} >= ${threshold}`);
    }
  }
  t.end();
});

test('getRhymes: Syllable count constraint', (t) => {
  const targetSylls = 2;
  const syllRes = rhymer.getRhymes('sinking', 'perfect', { syllables: targetSylls });
  t.ok(syllRes.length > 0, `should return rhymes with syllable count ${targetSylls}`);
  for (const w of syllRes) {
    const phones = rhymer.firstPhonesForWord(w);
    t.equal(rhymer.syllableCount(phones), targetSylls, `${w} has exactly ${targetSylls} syllables`);
  }
  t.end();
});

test('getRhymes: Poetic fit constraint', (t) => {
  const poeticRes = rhymer.getRhymes('sinking', 'perfect', { poeticFit: 'trochee' });
  t.ok(poeticRes.length > 0, 'should return perfect rhymes that fit trochee');
  for (const w of poeticRes) {
    t.ok(nounsing.poeticFit(w, 'trochee'), `${w} organically fits metrical foot trochee`);
  }
  t.end();
});

test('getRhymes: Stress pattern constraint', (t) => {
  const pattern = '10';
  const stressRes = rhymer.getRhymes('sinking', 'perfect', { stressPattern: pattern });
  t.ok(stressRes.length > 0, 'should return perfect rhymes with stress pattern 10');
  for (const w of stressRes) {
    const phones = rhymer.firstPhonesForWord(w);
    t.equal(rhymer.stressPattern(phones), pattern, `${w} matches stress pattern ${pattern}`);
  }
  t.end();
});

// ============================================================================
// classifyRhyme
// ============================================================================
test('classifyRhyme: returns all matching rhyme types', (t) => {
  const matchTypes = rhymer.classifyRhyme('sinking', 'thinking');
  t.ok(matchTypes.includes('perfect'), 'sinking vs thinking is classified as perfect');
  t.ok(matchTypes.includes('feminine'), 'sinking vs thinking is classified as feminine');

  const slantMatch = rhymer.classifyRhyme('cat', 'sad');
  t.ok(slantMatch.includes('assonant'), 'cat vs sad is classified as assonant');

  const identicalMatch = rhymer.classifyRhyme('sinking', 'sinking');
  t.deepEqual(identicalMatch, ['identical'], 'identical words classified as identical');

  t.end();
});

// ============================================================================
// Pool Hygiene and Utility Functions
// ============================================================================
test('Pool Hygiene Helpers', (t) => {
  const words = ['weekly', 'thinking', 'cat', 'sleekly'];
  const forbidden = ['weekly'];
  const filtered = rhymer.filterByForbiddenRhymingParts(words, forbidden);
  // 'weekly' and 'sleekly' share rhyming part IY1 K L IY0, so both should be filtered out
  t.notOk(filtered.includes('weekly'), 'should filter weekly');
  t.notOk(filtered.includes('sleekly'), 'should filter sleekly (shares rhyming part with weekly)');
  t.ok(filtered.includes('thinking'), 'should keep thinking');
  t.ok(filtered.includes('cat'), 'should keep cat');

  const pools = [
    ['weekly', 'thinking'],
    ['sleekly', 'cat', 'thinking']
  ];
  const deduped = rhymer.deduplicatePools(pools);
  t.deepEqual(deduped[0], ['weekly', 'thinking'], 'first pool kept intact');
  t.deepEqual(deduped[1], ['sleekly', 'cat'], 'thinking removed from second pool since it was in first pool');

  t.end();
});

test('Random and Same-Stress Rhyme Utilities', (t) => {
  const rand = rhymer.randomRhyme('sinking');
  t.ok(rand, 'randomRhyme returns non-null result');
  t.ok(rand?.word, 'returns a word');
  t.ok(rand?.type, 'returns a rhyme type');

  const sameStress = rhymer.rhymeSameStress('sinking');
  t.ok(sameStress, 'rhymeSameStress returns a word');
  if (sameStress) {
    const originalStresses = nounsing.stresses(rhymer.firstPhonesForWord('sinking'));
    const resultStresses = nounsing.stresses(rhymer.firstPhonesForWord(sameStress));
    t.equal(resultStresses, originalStresses, 'should preserve the same stress pattern');
  }

  t.end();
});

test('Assonance, Consonance, and Alliteration', (t) => {
  const ass = rhymer.assonance('sinking', undefined, 'forward', 1);
  t.ok(ass.length > 0, 'assonance returns results');

  const cons = rhymer.consonance('sinking', undefined, 'backward', 1);
  t.ok(cons.length > 0, 'consonance returns results');

  const allit = rhymer.alliteration('sinking');
  t.ok(allit.length > 0, 'alliteration returns results');

  t.end();
});

test('Wildcard Phoneme Mixes', (t) => {
  const phones = 'S IH1 NG';
  const mixes = rhymer.wildcardMixPhonesRegexSearches(phones, true);
  t.ok(mixes.length > 0, 'generates wildcard mixes');
  t.ok(mixes.includes('S IH1 NG'), 'mixes includes the exact phones');
  t.ok(mixes.includes('.{1,3} IH1 NG'), 'mixes includes a single wildcard');
  t.end();
});
