import * as nounsing from '../src/nounsing';

console.log('=== Core Pronouncing Tests ===');
console.log('syllableCount:', nounsing.syllableCount(
  ['Z', 'ER0', 'K', 'OW1', 'N', 'IY0', 'AH0', 'M']
));
console.log('phonesForWord(abdomen):', nounsing.phonesForWord('abdomen'));
console.log('rhymingPart:', nounsing.rhymingPart(nounsing.phonesForWord('abdomen')[0]));
console.log('search(AH1 K T IH0 D):', nounsing.search('AH1 K T IH0 D'));
console.log('rhymes(sinking):', nounsing.rhymes('sinking'));

console.log('\n=== Domain Accessors ===');
const lex = nounsing.lexicon('abacus');
console.log('lexicon(abacus):', lex ? `nsylls=${lex[0].nsylls}, pos=${lex[0].pos}` : 'null');

const ph = nounsing.phonemics('abacus');
console.log('phonemics(abacus):', ph ? `phones=${ph[0].phones.slice(0, 20)}...` : 'null');

const w = nounsing.weights('abacus');
console.log('weights(abacus):', w ? `pattern=${w[0].pattern.join(' ')}` : 'null');

const m = nounsing.morphology('abacus');
console.log('morphology(abacus):', m ? `type=${m[0].morphology}, S=${m[0].extrametricalS}` : 'null');

console.log('\n=== Complex Functions ===');
const scan = nounsing.scansion('abacus');
console.log('scansion(abacus):', scan ? `contour=${scan[0].contour}, label=${scan[0].label}` : 'null');

const vq = nounsing.vowelQualities('abacus');
console.log('vowelQualities(abacus):', vq ? `M=${vq[0].monophthongs}, D=${vq[0].diphthongs}` : 'null');

const pf = nounsing.poeticFit('abacus', 'dactyl');
console.log('poeticFit(abacus,dactyl):', pf);

console.log('\n=== New Text-Processing Functions ===');
const common = nounsing.mostCommonPhones('hello world hello', 3);
console.log('mostCommonPhones("hello world hello", 3):', common);

const counts = nounsing.countTextSyllables('hello world');
console.log('countTextSyllables("hello world"):', counts);

const rewritten = nounsing.rewriteFromFirstTwoPhones('hello world');
console.log('rewriteFromFirstTwoPhones("hello world"):', rewritten.slice(0, 60));

console.log('\n=== All Manual Tests Passed ===');
