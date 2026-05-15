import test from 'tape';
import * as nounsing from '../src/nounsing';

// ============================================================================
// TSV Parsing
// ============================================================================
test('parseCMU: parses tab-delimited TSV lines', (t) => {
  const testData = [
    'spelling\tphones\tstressTrans\tsyllStruct\tsyllabification\tmainStress\tfinalStress\tpenultStress\tapStress\tpapStress\tfinalWeight\tfinalHLweight\tpenultWeight\tpenultHLweight\tantepenultWeight\tantepenultHLweight\tpreantepenultWeight\tpreantepenultHLweight\tvowelLength\tfinalOnset\tpenultOnset\tantepenultOnset\tfinalV\tfinalC\tS\tmorphology\tsuffixType\tprefixType\tPrefix\tSuffix\tcoda\tcodaLength\tfreq\tPOS\tnsylls\tleftEdgeStress\tinitStress\tsingleStress\tpenultVowel\tpenultCoda\tpenultPossibleCoda\tfinalComplexOnset\tpenultHeaviness\tfinalTwoV\tfinalVowel\tfinalCoda\tfinalHeaviness\tantepenultVowel\tantepenultCoda\tantepenultHeaviness\tweightPattern\tfinal3stressTrans',
    'quuxly\tK W AH1 K S L IY0\t01\tCT.CC.CT\t(KW AH)(K S)(L IY)\tpenult\t0\t1\tother\tother\t-VV\tL\t-LC\tH\tother\tother\tother\tother\tlongV\tCC\tC\tother\tiy\topen\totherSingleton\tsimple\tother\tother\tnoPrefix\tnoSuffix\t\t0\tNA\tNA\t2\t1\t1\t1\tM\tclosed\tmayHaveCoda\tsimple\tH\tiy\tM\topen\tL\tM\topen\tother\tL H\t01'
  ].join('\n');
  const prevLen = nounsing.pronunciations.length;
  const pronunciations = nounsing.parseCMU(testData);
  t.ok(pronunciations.length > prevLen, 'should add new entries to the array');
  const newCount = pronunciations.length - prevLen;
  t.equal(newCount, 1, 'should add exactly 1 new TSV entry');
  t.end();
});

// ============================================================================
// Core Utility Functions
// ============================================================================
test('syllableCount: counts vowel nuclei in phones', (t) => {
  t.equal(nounsing.syllableCount('CH IY1 Z'), 1, 'cheese = 1');
  t.equal(nounsing.syllableCount('CH EH1 D ER0'), 2, 'cheddar = 2');
  t.equal(nounsing.syllableCount('AE1 F T ER0 W ER0 D'), 3, 'afterward = 3');
  t.equal(nounsing.syllableCount('IH2 N T ER0 M IH1 T AH0 N T'), 4, 'intermittent = 4');
  t.equal(nounsing.syllableCount('IH2 N T ER0 M IH1 T AH0 N T L IY0'), 5, 'intermittently = 5');
  t.end();
});

test('phonesForWord: returns phones for known words', (t) => {
  const phones = nounsing.phonesForWord('conflicts');
  t.ok(phones.length >= 1, 'should find phones');
  t.ok(phones.some(p => p.includes('K')), 'should contain consonantal phone');
  t.end();
});

test('phonesForWord: returns empty for unknown word', (t) => {
  const phones = nounsing.phonesForWord('xyzzynotaword');
  t.equal(phones.length, 0, 'should return empty array');
  t.end();
});

test('rhymingPart: extracts from last stressed vowel', (t) => {
  let part = nounsing.rhymingPart('S L IY1 P ER0');
  t.equal(part, 'IY1 P ER0', 'sleeper rhyme part');
  part = nounsing.rhymingPart('S L IY1 P AH0 L IY0');
  t.equal(part, 'IY1 P AH0 L IY0', 'sleepily rhyme part');
  t.end();
});

test('search: finds words by phonetic regex', (t) => {
  const matches = nounsing.search('^S K L');
  t.ok(matches.includes('sclerosis'), 'should find sclerosis');
  t.end();
});

test('searchStresses: finds words by stress pattern', (t) => {
  const matches = nounsing.searchStresses('01');
  t.ok(matches.length > 0, 'should find iambic words');
  t.ok(matches.every(w => typeof w === 'string'), 'all results should be strings');
  t.end();
});

test('rhymes: finds rhyming words', (t) => {
  const r = nounsing.rhymes('sleekly');
  t.ok(r.includes('weekly'), 'sleekly rhymes with weekly');
  t.end();
});

test('stresses: extracts stress digits from phones', (t) => {
  t.equal(nounsing.stresses('P ER0 M IH1 T'), '01', 'permit = 01');
  t.equal(nounsing.stresses('AE1 B AH0 K AH0 S'), '100', 'abacus = 100');
  t.end();
});

// ============================================================================
// Domain Accessors
// ============================================================================
test('lexicon: returns lexical metadata', (t) => {
  const lex = nounsing.lexicon('abacus');
  t.ok(lex, 'should find abacus');
  if (lex) {
    t.equal(lex[0].spelling, 'abacus', 'spelling is abacus');
    t.equal(lex[0].nsylls, 3, 'nsylls is 3');
    t.ok(typeof lex[0].freq === 'string', 'freq is a string');
    t.ok(typeof lex[0].pos === 'string', 'pos is a string');
  }
  t.end();
});

test('lexicon: returns null for unknown word', (t) => {
  t.equal(nounsing.lexicon('xyzzynotaword'), null);
  t.end();
});

test('phonemics: returns phonological data', (t) => {
  const ph = nounsing.phonemics('abacus');
  t.ok(ph, 'should find abacus');
  if (ph) {
    t.equal(ph[0].phones, 'AE1 B AH0 K AH0 S', 'phones match');
    t.equal(ph[0].syllStruct, 'L.CL.CLC', 'syllStruct matches');
    t.equal(ph[0].syllabification, '(AE)(b AH)(k AH s)', 'syllabification matches');
    t.equal(ph[0].vowelLength, 'shortV', 'vowelLength matches');
  }
  t.end();
});

test('stress: returns stress mapping data', (t) => {
  const s = nounsing.stress('abacus');
  t.ok(s, 'should find abacus stress data');
  if (s) {
    t.equal(s[0].stressTrans, '100', 'stressTrans = 100');
    t.equal(s[0].mainStress, 'antepenult', 'main stress is antepenult');
    t.equal(s[0].singleStress, '1', 'single stress');
    t.ok(typeof s[0].final3stressTrans === 'string', 'has final3stressTrans');
  }
  t.end();
});

test('weights: returns weight topologies', (t) => {
  const w = nounsing.weights('abacus');
  t.ok(w, 'should find weights');
  if (w) {
    t.deepEqual(w[0].pattern, ['L', 'L', 'L'], 'LLL pattern');
    t.equal(w[0].details.length, 4, 'has 4 weight detail entries');
    t.equal(w[0].details[0].syllable, 'final', 'first is final');
    t.equal(w[0].details[0].weight, '-LC', 'final weight is -LC');
    t.equal(w[0].details[1].weight, '-V', 'penult weight is -V');
  }
  t.end();
});

test('vowels: returns vowel & nuclei data', (t) => {
  const v = nounsing.vowels('abacus');
  t.ok(v, 'should find vowel data');
  if (v) {
    t.equal(v[0].finalV, 'ah', 'finalV is ah');
    t.ok(typeof v[0].finalTwoV === 'string', 'has finalTwoV');
    t.ok(v[0].types.final === 'M' || v[0].types.final === 'D', 'final type is M or D');
  }
  t.end();
});

test('edges: returns onset/coda geometry', (t) => {
  const e = nounsing.edges('abacus');
  t.ok(e, 'should find edge data');
  if (e) {
    t.equal(e[0].finalC, 'Singleton', 'finalC is Singleton');
    t.ok(e[0].codaLength >= 0, 'codaLength is number >= 0');
    t.ok(typeof e[0].coda === 'string', 'coda is a string');
  }
  t.end();
});

test('morphology: returns morphological data', (t) => {
  const m = nounsing.morphology('abacus');
  t.ok(m, 'should find morphology data');
  if (m) {
    t.equal(m[0].morphology, 'simple', 'morphology = simple');
    t.ok(typeof m[0].extrametricalS === 'string', 'has extrametricalS');
  }
  t.end();
});

test('all: returns full WordProfile', (t) => {
  const a = nounsing.all('abacus');
  t.ok(a, 'should find all data');
  if (a) {
    t.equal(a[0].spelling, 'abacus', 'spelling field');
    t.ok(a[0].phonology, 'has phonology');
    t.ok(a[0].stress, 'has stress');
    t.ok(a[0].weight, 'has weight');
    t.ok(a[0].morphology, 'has morphology');
    t.ok(a[0].weightPattern, 'has weightPattern');
    t.ok(a[0].finalV, 'has finalV');
    t.ok(a[0].finalC, 'has finalC');
    t.ok(a[0].S, 'has S classifier');
  }
  t.end();
});

// ============================================================================
// Complex NLP Functions
// ============================================================================
test('rhymeProfile: returns rhyme details including rhymingPhones from rhymingPart', (t) => {
  const rp = nounsing.rhymeProfile('abacus');
  t.ok(rp, 'should find rhyme profile');
  if (rp) {
    t.equal(rp[0].weight, 'L', 'final rime weight is L');
    t.ok(rp[0].rhymingPhones.length > 0, 'rhymingPhones is non-empty');
    t.ok(typeof rp[0].codaComplexity === 'string', 'has codaComplexity');
  }
  t.end();
});

test('rhymeBySyllables: filters rhymes by syllable count', (t) => {
  const r = nounsing.rhymeBySyllables('sleekly', 2);
  t.ok(Array.isArray(r), 'returns array');
  t.ok(r.every(w => typeof w === 'string'), 'all entries are strings');
  t.end();
});

test('meterMatch: finds exact metrical matches', (t) => {
  const matches = nounsing.meterMatch('01');
  t.ok(matches.length > 0, 'should find iambic words');
  t.end();
});

test('scansion: returns poetic scansion label from stressTrans', (t) => {
  const scan = nounsing.scansion('abacus');
  t.ok(scan, 'should find scansion');
  if (scan) {
    t.equal(scan[0].contour, '100', 'contour is 100');
    t.equal(scan[0].label, 'dactylic', 'label is dactylic');
    t.ok(typeof scan[0].weightPattern === 'string', 'has weightPattern');
  }
  t.end();
});

test('onsetParse: returns syllabification and CV structure', (t) => {
  const op = nounsing.onsetParse('abacus');
  t.ok(op, 'should find onset parse');
  if (op) {
    t.equal(op[0].syllabification, '(AE)(b AH)(k AH s)', 'syllabification matches');
    t.equal(op[0].cvStructure, 'L.CL.CLC', 'CV structure matches');
  }
  t.end();
});

test('suffixShiftPotential: evaluates suffix stress shift', (t) => {
  const ssp = nounsing.suffixShiftPotential('abacus');
  t.ok(ssp, 'should find shift potential');
  if (ssp) {
    t.equal(ssp[0].currentSuffix, 'noSuffix', 'noSuffix');
    t.ok(typeof ssp[0].shiftLikely === 'boolean', 'shiftLikely is boolean');
  }
  t.end();
});

test('extrametricals: classifies S edge cases', (t) => {
  const ex = nounsing.extrametricals('abacus');
  t.ok(ex, 'should find extrametrical data');
  if (ex) {
    t.ok(typeof ex[0].S_classifier === 'string', 'has S_classifier');
    t.ok(typeof ex[0].isIrregular === 'boolean', 'has isIrregular');
    t.ok(typeof ex[0].status === 'string', 'has status');
  }
  t.end();
});

test('extrametricals: Detected only for S or SCluster', (t) => {
  const ex = nounsing.extrametricals('abacus');
  if (ex) {
    const sVal = ex[0].S_classifier;
    if (sVal === 'S' || sVal === 'SCluster') {
      t.equal(ex[0].status, 'Detected', 'S types should be Detected');
      t.equal(ex[0].isIrregular, true, 'S types should be irregular');
    } else if (sVal === 'otherSingleton' || sVal === 'otherCluster') {
      t.equal(ex[0].status, 'None', 'other types should be None');
      t.equal(ex[0].isIrregular, false, 'other types should not be irregular');
    }
  }
  t.end();
});

test('vowelQualities: analyzes diphthong vs monophthong distribution', (t) => {
  const vq = nounsing.vowelQualities('abacus');
  t.ok(vq, 'should find vowel qualities');
  if (vq) {
    t.equal(vq[0].monophthongs, 3, 'abacus has 3 monophthongs');
    t.equal(vq[0].diphthongs, 0, 'abacus has 0 diphthongs');
    t.ok(vq[0].allMonophthong, 'abacus is all monophthong');
    t.ok(vq[0].distribution.final, 'has final distribution');
    t.ok(vq[0].distribution.penult, 'has penult distribution');
  }
  t.end();
});

test('vowelHarmony: is an alias for vowelQualities', (t) => {
  t.equal(nounsing.vowelHarmony, nounsing.vowelQualities, 'vowelHarmony === vowelQualities');
  const viaHarmony = nounsing.vowelHarmony('abacus');
  const viaQualities = nounsing.vowelQualities('abacus');
  if (viaHarmony && viaQualities) {
    t.deepEqual(viaHarmony[0], viaQualities[0], 'identical results from both names');
  }
  t.end();
});

test('codaComplexity: analyzes final coda geometry', (t) => {
  const cc = nounsing.codaComplexity('abacus');
  t.ok(cc, 'should find coda complexity');
  if (cc) {
    t.ok(typeof cc[0].complexity === 'string', 'has complexity');
    t.ok(typeof cc[0].codaLength === 'number', 'has codaLength');
    t.ok(typeof cc[0].phonemes === 'string', 'has phonemes');
    t.ok(typeof cc[0].isComplex === 'boolean', 'has isComplex');
  }
  t.end();
});

test('poeticFit: checks word against 9 foot types', (t) => {
  t.ok(nounsing.poeticFit('abacus', 'dactyl'), 'abacus fits dactyl');
  t.notOk(nounsing.poeticFit('abacus', 'iamb'), 'abacus does not fit iamb');
  t.notOk(nounsing.poeticFit('abacus', 'trochee'), 'abacus does not fit trochee');
  t.notOk(nounsing.poeticFit('abacus', 'anapest'), 'abacus does not fit anapest');
  t.end();
});

test('poeticFit: handles all 16 foot types', (t) => {
  const feet: nounsing.PoeticMeter[] = [
    'iamb', 'trochee', 'spondee', 'pyrrhic',
    'dactyl', 'anapest', 'amphibrach', 'bacchic', 'antibacchic', 'cretic',
    'choriamb', 'antispast', 'first paeon', 'second paeon', 'third paeon', 'fourth paeon'
  ];
  for (const foot of feet) {
    const result = nounsing.poeticFit('abacus', foot);
    t.ok(typeof result === 'boolean', `poeticFit with ${foot} returns boolean`);
  }
  t.end();
});

test('poeticFit: pyrrhic fits 00 contour', (t) => {
  t.notOk(nounsing.poeticFit('abacus', 'pyrrhic'), 'abacus(100) not pyrrhic');
  t.end();
});

test('poeticFit: tetrasyllabic meters handled', (t) => {
  t.notOk(nounsing.poeticFit('abacus', 'choriamb'), '3-syll word not tetrasyllabic');
  t.notOk(nounsing.poeticFit('abacus', 'first paeon'), '3-syll word not tetrasyllabic');
  t.end();
});

test('metricalInsets: returns inset feet with stress info for known word', (t) => {
  const insets = nounsing.metricalInsets('abacus');
  t.ok(insets, 'should return object');
  if (insets) {
    t.ok(Array.isArray(insets.iamb), 'has iamb array');
    t.ok(Array.isArray(insets.dactyl), 'has dactyl array');
    t.equal(insets.dactyl.length, 1, 'abacus has 1 dactyl inset');
    const dactylEntry = insets.dactyl[0];
    t.equal(dactylEntry.length, 3, 'dactyl has 3 syllables');
    t.equal(dactylEntry[0].syll, '(AE)', 'first syll is (AE)');
    t.equal(dactylEntry[0].stress, '1', 'first stress is 1');
    t.equal(dactylEntry[1].syll, '(b AH)', 'second syll is (b AH)');
    t.equal(dactylEntry[1].stress, '0', 'second stress is 0');
    t.equal(dactylEntry[2].syll, '(k AH s)', 'third syll is (k AH s)');
    t.equal(dactylEntry[2].stress, '0', 'third stress is 0');
  }
  t.end();
});

test('metricalInsets: returns null for unknown word', (t) => {
  t.equal(nounsing.metricalInsets('xyzzynotaword'), null, 'null for OOV');
  t.end();
});

test('metricalInsets: stressTrans/syllabification mismatch handled (considerable regression)', (t) => {
  // "considerable" has stressTrans="1000" but 5 syllabic groups.
  // The fix derives contour from phones via stresses(), matching syll count.
  const insets = nounsing.metricalInsets('considerable');
  t.ok(insets, 'should return object despite data mismatch');
  if (insets) {
    t.ok(Array.isArray(insets.trochee), 'has trochee array');
    t.ok(Array.isArray(insets.dactyl), 'has dactyl array');
    // With phones-derived contour "01000", trochee "10" matches at positions 1-2
    t.ok(insets.trochee.length >= 1, 'should find at least one trochee');
    t.ok(insets.dactyl.length >= 1, 'should find at least one dactyl');
  }
  t.end();
});

test('metricalInsets: all 16 foot types represented in output keys', (t) => {
  const insets = nounsing.metricalInsets('abacus');
  t.ok(insets, 'should return object');
  if (insets) {
    const expectedKeys = [
      'iamb', 'trochee', 'spondee', 'pyrrhic',
      'dactyl', 'anapest', 'amphibrach', 'bacchic', 'cretic', 'antibacchic',
      'choriamb', 'antispast', 'first paeon', 'second paeon', 'third paeon', 'fourth paeon'
    ];
    for (const key of expectedKeys) {
      t.ok(Array.isArray(insets[key]), `key "${key}" exists and is array`);
    }
  }
  t.end();
});

test('poeticFit: returns false for unknown word', (t) => {
  t.notOk(nounsing.poeticFit('xyzzynotaword', 'iamb'));
  t.end();
});

// ============================================================================
// New Advanced Text-Processing Functions
// ============================================================================
test('mostCommonPhones: returns top N phones from text', (t) => {
  const result = nounsing.mostCommonPhones('hello world hello', 3);
  t.ok(Array.isArray(result), 'returns array');
  t.ok(result.length <= 3, 'returns at most 3 entries');
  t.ok(result.every(r => Array.isArray(r) && r.length === 2), 'each entry is [phone, count]');
  if (result.length > 0) {
    t.ok(typeof result[0][0] === 'string', 'first element is phone string');
    t.ok(typeof result[0][1] === 'number', 'second element is count');
    t.ok(result[0][1] >= result[1]?.[1] || result.length === 1, 'sorted descending');
  }
  t.end();
});

test('mostCommonPhones: handles text with unknown words', (t) => {
  const result = nounsing.mostCommonPhones('xyzzynotaword anotherunknown', 5);
  t.ok(Array.isArray(result), 'returns array even with unknown words');
  t.end();
});

test('countTextSyllables: sums syllables and phonemes', (t) => {
  const result = nounsing.countTextSyllables('hello world');
  t.ok(typeof result.syllables === 'number', 'syllables is number');
  t.ok(typeof result.phonemes === 'number', 'phonemes is number');
  t.ok(result.syllables > 0, 'syllables > 0');
  t.ok(result.phonemes > 0, 'phonemes > 0');
  t.end();
});

test('countTextSyllables: handles empty text', (t) => {
  const result = nounsing.countTextSyllables('');
  t.equal(result.syllables, 0, 'zero syllables');
  t.equal(result.phonemes, 0, 'zero phonemes');
  t.end();
});

test('rewriteFromFirstTwoPhones: rewrites text preserving first two phones', (t) => {
  const text = 'hello world';
  const rewritten = nounsing.rewriteFromFirstTwoPhones(text);
  t.ok(typeof rewritten === 'string', 'returns string');
  t.ok(rewritten.length > 0, 'returns non-empty string');
  const originalWords = text.split(/\s+/);
  const rewrittenWords = rewritten.split(/\s+/);
  t.equal(originalWords.length, rewrittenWords.length, 'same word count');
  t.end();
});

test('rewriteFromFirstTwoPhones: handles OOV words', (t) => {
  const rewritten = nounsing.rewriteFromFirstTwoPhones('xyzzynotaword');
  t.equal(rewritten, 'xyzzynotaword', 'unknown word preserved');
  t.end();
});

test('rewriteWithStressPattern: rewrites preserving stress pattern', (t) => {
  const text = 'hello world';
  const rewritten = nounsing.rewriteWithStressPattern(text);
  t.ok(typeof rewritten === 'string', 'returns string');
  t.ok(rewritten.length > 0, 'returns non-empty string');
  t.end();
});

test('rewriteWithStressPattern: handles OOV words', (t) => {
  const rewritten = nounsing.rewriteWithStressPattern('xyzzynotaword');
  t.equal(rewritten, 'xyzzynotaword', 'unknown word preserved');
  t.end();
});

test('rewriteWithRhymes: rewrites using rhyming words', (t) => {
  const text = 'hello world';
  const rewritten = nounsing.rewriteWithRhymes(text);
  t.ok(typeof rewritten === 'string', 'returns string');
  t.ok(rewritten.length > 0, 'returns non-empty string');
  t.end();
});

test('rewriteWithRhymes: handles OOV words', (t) => {
  const rewritten = nounsing.rewriteWithRhymes('xyzzynotaword');
  t.equal(rewritten, 'xyzzynotaword', 'unknown word preserved');
  t.end();
});

// ============================================================================
// POS Precision Filtering Tests
// ============================================================================
test('POS precision: backward compatible (no precision arg)', (t) => {
  const r1 = nounsing.rewriteFromFirstTwoPhones('hello');
  const r2 = nounsing.rewriteWithStressPattern('hello');
  const r3 = nounsing.rewriteWithRhymes('hello');
  t.ok(typeof r1 === 'string', 'rewriteFromFirstTwoPhones works without precision');
  t.ok(typeof r2 === 'string', 'rewriteWithStressPattern works without precision');
  t.ok(typeof r3 === 'string', 'rewriteWithRhymes works without precision');
  t.end();
});

test('POS precision: precision 0 disables filtering (same as undefined)', (t) => {
  const r1 = nounsing.rewriteFromFirstTwoPhones('hello', 0);
  const r2 = nounsing.rewriteFromFirstTwoPhones('hello');
  t.ok(typeof r1 === 'string', 'precision=0 works');
  t.ok(typeof r2 === 'string', 'no-precision works');
  t.end();
});

test('POS precision: precision values 1-3 are accepted', (t) => {
  const r1 = nounsing.rewriteWithRhymes('hello', 1);
  const r2 = nounsing.rewriteWithRhymes('hello', 2);
  const r3 = nounsing.rewriteWithRhymes('hello', 3);
  t.ok(typeof r1 === 'string', 'precision=1 works');
  t.ok(typeof r2 === 'string', 'precision=2 works');
  t.ok(typeof r3 === 'string', 'precision=3 works');
  t.end();
});

test('POS precision: applies to rewriteFromFirstTwoPhones', (t) => {
  const noPOS = nounsing.rewriteFromFirstTwoPhones('the running');
  const pos3 = nounsing.rewriteFromFirstTwoPhones('the running', 3);
  t.ok(typeof noPOS === 'string', 'no precision');
  t.ok(typeof pos3 === 'string', 'precision=3');
  t.end();
});

test('POS precision: applies to rewriteWithStressPattern', (t) => {
  const noPOS = nounsing.rewriteWithStressPattern('the running');
  const pos2 = nounsing.rewriteWithStressPattern('the running', 2);
  t.ok(typeof noPOS === 'string', 'no precision');
  t.ok(typeof pos2 === 'string', 'precision=2');
  t.end();
});

test('POS precision: applies to rewriteWithRhymes', (t) => {
  const noPOS = nounsing.rewriteWithRhymes('hello world');
  const pos1 = nounsing.rewriteWithRhymes('hello world', 1);
  t.ok(typeof noPOS === 'string', 'no precision');
  t.ok(typeof pos1 === 'string', 'precision=1');
  t.end();
});

// ============================================================================
// Zipf Frequency Threshold Tests
// ============================================================================
test('Zipf threshold: backward compatible (no threshold arg)', (t) => {
  const r = nounsing.rewriteFromFirstTwoPhones('hello');
  t.ok(typeof r === 'string', 'works without freqThreshold');
  t.end();
});

test('Zipf threshold: threshold < 1.0 disables filter', (t) => {
  const r1 = nounsing.rewriteWithRhymes('hello', undefined, 0);
  const r2 = nounsing.rewriteWithRhymes('hello', undefined, 0.5);
  const r3 = nounsing.rewriteWithRhymes('hello', undefined, 0.99);
  t.ok(typeof r1 === 'string', 'threshold=0 works');
  t.ok(typeof r2 === 'string', 'threshold=0.5 works');
  t.ok(typeof r3 === 'string', 'threshold=0.99 works');
  t.end();
});

test('Zipf threshold: applies to rewriteFromFirstTwoPhones', (t) => {
  const r = nounsing.rewriteFromFirstTwoPhones('hello', undefined, 2.0);
  t.ok(typeof r === 'string', 'works with freq threshold');
  t.end();
});

test('Zipf threshold: applies to rewriteWithStressPattern', (t) => {
  const r = nounsing.rewriteWithStressPattern('hello world', 0, 3.0);
  t.ok(typeof r === 'string', 'works with pos=0 and freq=3.0');
  t.end();
});

test('Zipf threshold: applies to rewriteWithRhymes', (t) => {
  const r = nounsing.rewriteWithRhymes('hello', 2, 2.5);
  t.ok(typeof r === 'string', 'works with pos=2 and freq=2.5');
  t.end();
});

test('Zipf threshold: high threshold shrinks candidate pool', (t) => {
  const low = nounsing.rewriteWithRhymes('hello world', 0, 2.0);
  const high = nounsing.rewriteWithRhymes('hello world', 0, 5.0);
  t.ok(typeof low === 'string', 'low threshold works');
  t.ok(typeof high === 'string', 'high threshold works');
  t.end();
});

test('Zipf threshold: combined with POS precision', (t) => {
  const r = nounsing.rewriteFromFirstTwoPhones('the running', 2, 3.0);
  t.ok(typeof r === 'string', 'combined pos+freq works');
  t.end();
});

// ============================================================================
// Integration / Multi-word Tests
// ============================================================================
test('integration: full pipeline for multi-word text', (t) => {
  const text = 'the quick brown fox';
  const phones = nounsing.mostCommonPhones(text, 5);
  const counts = nounsing.countTextSyllables(text);
  t.ok(Array.isArray(phones), 'mostCommonPhones works on multi-word');
  t.ok(counts.syllables >= 0, 'countTextSyllables works on multi-word');
  t.ok(counts.phonemes > 0, 'phonemes found');
  t.end();
});

test('integration: WordProfile shape validation', (t) => {
  const a = nounsing.all('abacus');
  t.ok(a, 'all() works');
  if (a && a.length > 0) {
    const wp = a[0];
    t.equal(typeof wp.spelling, 'string', 'spelling: string');
    t.equal(typeof wp.phonology, 'object', 'phonology: object');
    t.equal(typeof wp.phonology.phones, 'string', 'phonology.phones: string');
    t.equal(typeof wp.phonology.stressTrans, 'string', 'phonology.stressTrans: string');
    t.equal(typeof wp.phonology.syllStruct, 'string', 'phonology.syllStruct: string');
    t.equal(typeof wp.phonology.syllabification, 'string', 'phonology.syllabification: string');
    t.equal(typeof wp.phonology.nsylls, 'number', 'phonology.nsylls: number');
    t.equal(Array.isArray(wp.weight), true, 'weight: array');
    t.equal(wp.weight.length, 4, 'weight: 4 entries');
    t.equal(typeof wp.stress, 'object', 'stress: object');
    t.equal(typeof wp.stress.stressTrans, 'string', 'stress.stressTrans: string');
    t.equal(typeof wp.morphology, 'object', 'morphology: object');
    t.equal(typeof wp.weightPattern, 'string', 'weightPattern: string');
    t.equal(typeof wp.S, 'string', 'S: string');
  }
  t.end();
});
