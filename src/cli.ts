import prompts from 'prompts';
import chalk from 'chalk';
import * as nounsing from './nounsing';

function sliceResults<T>(results: T[], label: string): T[] {
  const total = results.length;
  if (total <= 23) return results;
  console.log(chalk.yellow(`\n${total} ${label} found. Showing first 23:`));
  return results.slice(0, 23);
}

/**
 * Parses user slice input. Supports:
 *   empty / "all"      → all results
 *   number              → first N results  
 *   number-number       → range (e.g. "1300-1600")
 *   "letter"            → filter by first letter, all matches
 *   "letter N"          → filter by first letter, up to N matches
 *   "letters N"         → filter by first letters, up to N matches
 */
function parseSlice(input: string, results: string[]): string[] {
  const trimmed = input.trim();
  if (trimmed === '' || trimmed === 'all') return results;

  // Range: "1300-1600"
  const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10) - 1; // 1-indexed to 0-indexed
    const end = parseInt(rangeMatch[2], 10);
    if (start >= 0 && end > start) return results.slice(start, end);
    return results;
  }

  // Number: "1300"
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return results.slice(0, n);
  }

  // Letter prefix + optional count: "s", "s 100", "sa", "sa 10"
  const letterMatch = trimmed.match(/^([a-zA-Z]{1,10})\s*(\d+)?$/);
  if (letterMatch) {
    const prefix = letterMatch[1].toLowerCase();
    const filtered = results.filter(w => w.startsWith(prefix));
    if (letterMatch[2]) {
      const n = parseInt(letterMatch[2], 10);
      return filtered.slice(0, n);
    }
    return filtered;
  }

  // Fallback: try as number
  const n = parseInt(trimmed, 10);
  if (!isNaN(n) && n > 0) return results.slice(0, n);

  return results;
}

async function promptSlice(total: number, label: string, results: string[]): Promise<string[]> {
  if (total <= 23) return results;
  console.log(chalk.yellow(`\n${total} ${label} found.`));
  console.log(chalk.dim('Specify output: "all" for all | number for first N | "N-M" for range | "letter" for prefix | "letter N" for prefix+count'));
  const { count } = await prompts({
    type: 'text',
    name: 'count',
    message: 'Slice:'
  });
  if (count === undefined || count.trim() === '') return results;
  return parseSlice(count, results);
}

async function main() {
  console.log(chalk.bold.magenta('\n N O U N S I N G pro'));
  console.log(chalk.dim('Poetics & Phonology Toolkit'));
  console.log(chalk.dim('Powered by an augmented CMU Pronouncing Dictionary'));
  console.log(chalk.dim('Type "exit" or "quit" at any prompt to leave.\n'));

  while (true) {
    const { mainAction } = await prompts({
      type: 'select',
      name: 'mainAction',
      message: 'Main Menu — choose a path:',
      choices: [
        { title: chalk.cyan('1. Analyze a Single Word in Depth'), value: 'analyze' },
        { title: chalk.green('2. Search Dictionary'), value: 'search' },
        { title: chalk.yellow('3. Process a Phrase / Line / Text'), value: 'process' },
        { title: chalk.gray('Exit'), value: 'exit' }
      ]
    });

    if (!mainAction || mainAction === 'exit') {
      console.log(chalk.yellow('\nExiting Nounsing Pro. Goodbye!\n'));
      break;
    }

    if (mainAction === 'analyze') {
      await analyzeSingleWord();
    } else if (mainAction === 'search') {
      await searchDictionary();
    } else if (mainAction === 'process') {
      await processText();
    }
  }
}

// ============================================================================
// SUBMENU 1: ANALYZE SINGLE WORD IN DEPTH
// ============================================================================
async function analyzeSingleWord() {
  while (true) {
    const { word } = await prompts({
      type: 'text',
      name: 'word',
      message: 'Enter a word to analyze (or "back" for main menu):'
    });

    if (!word) {
      console.log(chalk.yellow('\nExiting Nounsing. Goodbye!\n'));
      process.exit(0);
    }

    const trimmed = word.trim().toLowerCase();
    if (['back', 'exit', 'quit'].includes(trimmed)) {
      if (trimmed === 'back') return;
      console.log(chalk.yellow('\nExiting Nounsing. Goodbye!\n'));
      process.exit(0);
    }

    const cleanWord = trimmed.replace(/[^a-z']/g, '');
    const data = nounsing.all(cleanWord);

    if (!data) {
      console.log(chalk.red(`\nWord "${cleanWord}" not found in the augmented dictionary.\n`));
      continue;
    }

    let subAction = '';
    while (!['back', 'main'].includes(subAction)) {
      const response = await prompts({
        type: 'select',
        name: 'subAction',
        message: `Analysis mode for "${chalk.cyan(cleanWord)}":`,
        choices: [
          { title: 'A. Quick Summary (Phonemics & Lexicon)', value: 'summary' },
          { title: 'B. Deep Scansion & Meter', value: 'scansion' },
          { title: 'C. Rime, Coda & Rhyme Profile', value: 'rhyme' },
          { title: 'D. Morphology & Extrametricals', value: 'morphology' },
          { title: 'E. Vowel Qualities', value: 'vowel' },
          { title: 'F. Onset Structure Analysis', value: 'onset' },
          { title: 'G. Granular Rime Weights', value: 'rimeWeights' },
          { title: 'H. Back to Word Selection', value: 'back' },
          { title: 'I. Main Menu', value: 'main' }
        ]
      });

      subAction = response.subAction || 'back';
      console.log('');

      if (subAction === 'summary') {
        const lex = nounsing.lexicon(cleanWord)?.[0];
        const ph = nounsing.phonemics(cleanWord)?.[0];
        console.log(chalk.bgCyan.black.bold(' QUICK SUMMARY '));
        console.log(`Spelling:       ${chalk.bold(lex?.spelling)}`);
        console.log(`Syllables:      ${chalk.yellow(lex?.nsylls)}`);
        console.log(`Part of Speech: ${chalk.magenta(lex?.pos)}`);
        console.log(`Zipf Frequency: ${chalk.green(lex?.freq)}`);
        console.log(`Vowel Length:   ${chalk.blueBright(ph?.vowelLength)}`);
        console.log(`Phones:         ${chalk.cyan(ph?.phones)}`);
        console.log(`CV Structure:   ${chalk.blue(ph?.syllStruct)}`);
        console.log(`Syllabified:    ${chalk.gray(ph?.syllabification)}\n`);
      } else if (subAction === 'scansion') {
        const scan = nounsing.scansion(cleanWord)?.[0];
        const w = nounsing.weights(cleanWord)?.[0];
        const st = nounsing.stress(cleanWord)?.[0];
        const scan_props = nounsing.all(cleanWord)?.[0];
        console.log(chalk.bgMagenta.white.bold(' DEEP SCANSION & METER '));
        console.log(`Stress Contour:    ${chalk.yellow(scan?.contour)}`);
        console.log(`Scansion Label:    ${chalk.bold.green(scan?.label)}`);
        if (w?.pattern) {
          const colored = w.pattern.map((p: string) =>
            p === 'H' ? chalk.bold.red(p) : chalk.cyan(p)
          ).join(' ');
          console.log(`Weight Pattern:    ${colored}`);
        }
        if (st) {
          console.log(`Main Stress:       ${chalk.magenta(st.mainStress)}`);
          console.log(`Left-Edge Stress:  ${chalk.magenta(st.leftEdgeStress)}`);
          console.log(`Initial Stress:    ${chalk.yellow(st.initStress)}`);
          console.log(`Single Stress:     ${st.singleStress === '1' ? chalk.green('Yes') : chalk.red('No')}`);
          console.log(`Final-3 Stress:    ${chalk.cyan(st.final3stressTrans)}`);
        }
        const meterNames: Array<{name: string, foot: nounsing.PoeticMeter}> = [
          { name: 'Iamb', foot: 'iamb' }, { name: 'Trochee', foot: 'trochee' },
          { name: 'Spondee', foot: 'spondee' }, { name: 'Pyrrhic', foot: 'pyrrhic' },
          { name: 'Dactyl', foot: 'dactyl' }, { name: 'Anapest', foot: 'anapest' },
          { name: 'Amphibrach', foot: 'amphibrach' }, { name: 'Bacchic', foot: 'bacchic' },
          { name: 'Cretic', foot: 'cretic' }, { name: 'Antibacchic', foot: 'antibacchic' },
          { name: 'Choriamb', foot: 'choriamb' }, { name: 'Antispast', foot: 'antispast' },
          { name: '1st Paeon', foot: 'first paeon' }, { name: '2nd Paeon', foot: 'second paeon' },
          { name: '3rd Paeon', foot: 'third paeon' }, { name: '4th Paeon', foot: 'fourth paeon' }
        ];
        console.log(chalk.bold.underline('\n HOLISTIC METERED FIT '));
        let matchedMeter = '';
        for (const m of meterNames) {
          if (nounsing.poeticFit(cleanWord, m.foot)) {
            matchedMeter = m.name;
            break;
          }
        }
        if (matchedMeter) {
          console.log(chalk.bold.green(`  ${matchedMeter}`));
        } else {
          console.log(chalk.dim('  No standard holistic meter detected.'));
        }
        const insets = nounsing.metricalInsets(cleanWord);
        if (insets) {
          console.log(chalk.bold.underline('\n INSET METRICAL FEET '));
          let foundAny = false;
          for (const [foot, slices] of Object.entries(insets)) {
            if (slices.length > 0) {
              foundAny = true;
              const footTitle = foot.charAt(0).toUpperCase() + foot.slice(1);
              const coloredSlices = slices.map(group => {
                return group.map((e: { syll: string; stress: string }) => {
                  if (e.stress === '1') return chalk.red(e.syll);
                  if (e.stress === '2') return chalk.magenta(e.syll);
                  return chalk.yellow(e.syll);
                }).join('');
              }).join(', ');
              console.log(`${chalk.cyan(footTitle.padEnd(14))} ${coloredSlices}`);
            }
          }
          if (!foundAny) console.log(chalk.dim('No standard inset feet detected.'));
        }
        console.log('');
      } else if (subAction === 'rhyme') {
        const rProfile = nounsing.rhymeProfile(cleanWord)?.[0];
        const coda = nounsing.codaComplexity(cleanWord)?.[0];
        const eData = nounsing.edges(cleanWord)?.[0];
        console.log(chalk.bgYellow.black.bold(' RIME, CODA & RHYME PROFILE '));
        console.log(`Rhyming Phones:      ${chalk.cyan(rProfile?.rhymingPhones)}`);
        const rWeight = rProfile?.weight;
        console.log(`Rime Heaviness:      ${rWeight === 'H' ? chalk.bold.red('H (Heavy)') : rWeight === 'L' ? chalk.cyan('L (Light)') : chalk.gray('NA')}`);
        const hasS = rProfile?.hasExtrametricalS;
        console.log(`Extrametrical S:     ${hasS ? chalk.red('Detected (S/SCluster)') : chalk.green('None')}`);
        console.log(`Coda Geometry:       ${chalk.yellow(coda?.complexity)}`);
        console.log(`Coda Phonemes:       ${chalk.gray(coda?.phonemes)} (Length: ${coda?.codaLength})`);
        if (eData) {
          console.log(`Final Coda:         ${chalk.blue(eData.finalC)}`);
          console.log(`Penult Possible Coda: ${chalk.magenta(eData.penultPossibleCoda)}`);
          console.log(`Final Complex Onset:  ${chalk.magenta(eData.finalComplexOnset)}\n`);
        }
      } else if (subAction === 'morphology') {
        const m = nounsing.morphology(cleanWord)?.[0];
        const shift = nounsing.suffixShiftPotential(cleanWord)?.[0];
        const extra = nounsing.extrametricals(cleanWord)?.[0];
        console.log(chalk.bgRed.white.bold(' MORPHOLOGY & EXTRAMETRICALS '));
        console.log(`Structure:           ${m?.morphology === 'complex' ? chalk.red('Complex') : chalk.green('Simple')}`);
        console.log(`Prefix:              ${m?.prefix !== 'noPrefix' ? chalk.yellow(m?.prefix) : chalk.gray('None')} (${m?.prefixType ?? 'N/A'})`);
        console.log(`Suffix:              ${m?.suffix !== 'noSuffix' ? chalk.yellow(m?.suffix) : chalk.gray('None')} (${m?.suffixType ?? 'N/A'})`);
        console.log(`Stress Shift Likelihood: ${shift?.shiftLikely ? chalk.red('High') : chalk.green('Low')}`);
        if (extra) {
          const sType = extra.S_classifier;
          let sDesc = chalk.gray('None');
          if (sType === 'S' || sType === 'SCluster') {
            sDesc = chalk.red(`Detected (${sType})`);
          } else if (sType === 'otherSingleton' || sType === 'otherCluster') {
            sDesc = chalk.yellow(`None — geometry: ${sType}`);
          }
          console.log(`Extrametrical S:     ${sDesc}`);
          console.log(`Final Coda Length:   ${extra.codaLength}`);
          console.log(`Final Complex Onset:  ${extra.finalComplexOnset}`);
        }
        console.log('');
      } else if (subAction === 'vowel') {
        const vq = nounsing.vowelQualities(cleanWord)?.[0];
        const vData = nounsing.vowels(cleanWord)?.[0];
        console.log(chalk.bgBlue.white.bold(' VOWEL QUALITIES '));
        if (vq) {
          console.log(`Monophthongs (M):    ${chalk.green(vq.monophthongs)}`);
          console.log(`Diphthongs (D):      ${chalk.yellow(vq.diphthongs)}`);
          console.log(`Pure Monophthong Word: ${vq.allMonophthong ? chalk.green('Yes') : chalk.gray('No')}`);
          if (vq.distribution) {
            console.log(`  Final Nucleus:     ${vq.distribution.final === 'D' ? chalk.yellow('Diphthong') : chalk.green('Monophthong')}`);
            console.log(`  Penult Nucleus:    ${vq.distribution.penult === 'D' ? chalk.yellow('Diphthong') : chalk.green('Monophthong')}`);
            console.log(`  Antepenult Nucleus:${vq.distribution.antepenult === 'D' ? chalk.yellow('Diphthong') : chalk.green('Monophthong')}`);
          }
        }
        if (vData) {
          console.log(`Final Vowel (ARPAbet): ${chalk.cyan(vData.finalV)}`);
          console.log(`Final-V Two-Way:       ${chalk.magenta(vData.finalTwoV)}\n`);
        }
      } else if (subAction === 'onset') {
        const w = nounsing.weights(cleanWord)?.[0];
        const ph = nounsing.phonemics(cleanWord)?.[0];
        const eData = nounsing.edges(cleanWord)?.[0];
        console.log(chalk.bgGreen.black.bold(' ONSET STRUCTURE ANALYSIS '));
        console.log(chalk.dim('Onsets in CV notation: 0 = null onset, C = singleton, CC = cluster of 2, CCC = cluster of 3'));
        if (w?.details) {
          for (const d of w.details) {
            const onsetRaw = d.onset;
            let onsetDesc = chalk.gray('null (vowel-initial)');
            if (onsetRaw === 'C') onsetDesc = chalk.green('singleton consonant');
            else if (onsetRaw === 'CC') onsetDesc = chalk.yellow('cluster (2 consonants)');
            else if (onsetRaw === 'CCC') onsetDesc = chalk.red('complex cluster (3 consonants)');
            else if (onsetRaw === '0') onsetDesc = chalk.gray('null (vowel-initial)');
            else if (onsetRaw !== 'NA') onsetDesc = chalk.cyan(onsetRaw);
            console.log(`  ${chalk.bold(d.syllable)} onset:  ${onsetDesc}  [dataset: ${chalk.dim(onsetRaw)}]`);
          }
        }
        if (ph) {
          console.log(`CV Syll. Structure:  ${chalk.blue(ph.syllStruct)}`);
          console.log(`Syllabification:     ${chalk.gray(ph.syllabification)}`);
        }
        if (eData) {
          console.log(`Final Coda Geometry:  ${chalk.yellow(eData.finalC)}`);
          console.log(`Final Complex Onset:  ${eData.finalComplexOnset === 'simple' ? chalk.green('simple') : chalk.red(eData.finalComplexOnset)}`);
          console.log(`Penult Possible Coda: ${chalk.magenta(eData.penultPossibleCoda)}`);
        }
        const op = nounsing.onsetParse(cleanWord)?.[0];
        if (op) {
          console.log(`Penult Closed?:      ${op.isPenultClosed ? chalk.red('Yes') : chalk.green('No')}`);
        }
        console.log('');
      } else if (subAction === 'rimeWeights') {
        const w = nounsing.weights(cleanWord)?.[0];
        console.log(chalk.bgCyan.black.bold(' GRANULAR RIME WEIGHTS '));
        console.log(chalk.dim('Full rime structure: -V (short vowel + open), -VV (long vowel + open), -LC (short vowel + consonant), -LCC (short vowel + cluster), -TCC (long vowel + cluster)'));
        console.log(chalk.dim('Heaviness: L = Light (monomoraic), H = Heavy (bimoraic)'));
        if (w?.details) {
          for (const d of w.details) {
            if (d.weight === 'NA' && d.heaviness === 'NA') continue;
            const hColor = d.heaviness === 'H' ? chalk.bold.red : chalk.cyan;
            console.log(`  ${chalk.bold(d.syllable)}: weight=${chalk.yellow(d.weight)}  heaviness=${hColor(d.heaviness)}  vowel=${chalk.magenta(d.vowel)}  coda=${chalk.blue(d.coda)}`);
          }
        }
        if (w?.pattern) {
          const colored = w.pattern.map((p: string) =>
            p === 'H' ? chalk.bold.red(p) : chalk.cyan(p)
          ).join(' ');
          console.log(`HL Pattern (last 3):  ${colored}`);
        }
        const rp = nounsing.rhymeProfile(cleanWord)?.[0];
        if (rp) {
          console.log(`Final Rime Weight:    ${rp.weight === 'H' ? chalk.bold.red('H (Heavy)') : chalk.cyan('L (Light)')}`);
          console.log(`Final Rime Phones:    ${chalk.gray(rp.rhymingPhones)}`);
        }
        console.log('');
      }
    }
    // Direct navigation: 'main' returns to main menu, 'back' goes to word selection (outer loop)
    if (subAction === 'main') return;
  }
}

// ============================================================================
// SUBMENU 2: SEARCH DICTIONARY
// ============================================================================
async function searchDictionary() {
  while (true) {
    const { searchAction } = await prompts({
      type: 'select',
      name: 'searchAction',
      message: 'Search Dictionary — choose operation:',
      choices: [
        { title: chalk.cyan('A. Rhyme Search'), value: 'rhyme' },
        { title: chalk.green('B. Pattern Search (text + meter)'), value: 'pattern' },
        { title: chalk.yellow('C. Meter Search (stress pattern)'), value: 'meter' },
        { title: chalk.magenta('D. RegEx Search (phonetic regex)'), value: 'regex' },
        { title: chalk.blue('E. Most Common Sounds'), value: 'common' },
        { title: chalk.gray('F. Back to Main Menu'), value: 'back' }
      ]
    });

    if (!searchAction || searchAction === 'back') return;

    if (searchAction === 'rhyme') {
      await searchRhyme();
    } else if (searchAction === 'pattern') {
      await searchPattern();
    } else if (searchAction === 'meter') {
      await searchMeter();
    } else if (searchAction === 'regex') {
      await searchRegex();
    } else if (searchAction === 'common') {
      await searchCommon();
    }
  }
}

async function searchRhyme() {
  const { word } = await prompts({
    type: 'text',
    name: 'word',
    message: 'Enter target word for rhyme search:'
  });
  if (!word || ['exit', 'quit', 'back'].includes(word.trim().toLowerCase())) return;

  const cleanWord = word.trim().toLowerCase().replace(/[^a-z']/g, '');
  const allPhones = nounsing.phonesForWord(cleanWord);
  if (allPhones.length === 0) {
    console.log(chalk.red(`\n"${cleanWord}" not found in dictionary.\n`));
    return;
  }

  const rPart = nounsing.rhymingPart(allPhones[0]);
  const results = nounsing.search(rPart + '$').filter(w => w !== cleanWord);

  console.log(chalk.cyan(`\nRhyming part: ${rPart}`));
  const sliced = await promptSlice(results.length, 'rhymes', results);
  console.log(chalk.green(`\nRhymes for "${cleanWord}" (showing ${sliced.length}):`));
  for (let i = 0; i < sliced.length; i += 5) {
    console.log('  ' + sliced.slice(i, i + 5).join(', '));
  }
  console.log('');
}

async function searchPattern() {
  const { pattern } = await prompts({
    type: 'text',
    name: 'pattern',
    message: 'Enter text pattern (e.g. "arb"):'
  });
  if (!pattern || ['exit', 'quit', 'back'].includes(pattern.trim().toLowerCase())) return;

  const { matchStart } = await prompts({
    type: 'select',
    name: 'matchStart',
    message: 'Match start of words only?',
    choices: [
      { title: 'Yes (prefix match)', value: true },
      { title: 'No (anywhere in word)', value: false }
    ]
  });

  if (matchStart === undefined) return;

  const meterOptions: Array<{title: string, value: string}> = [
    { title: 'Iambic (01)', value: 'iamb' },
    { title: 'Trochee (10)', value: 'trochee' },
    { title: 'Spondee (11)', value: 'spondee' },
    { title: 'Pyrrhic (00)', value: 'pyrrhic' },
    { title: 'Dactyl (100)', value: 'dactyl' },
    { title: 'Anapest (001)', value: 'anapest' },
    { title: 'Amphibrach (010)', value: 'amphibrach' },
    { title: 'Bacchic (011)', value: 'bacchic' },
    { title: 'Antibacchic (110)', value: 'antibacchic' },
    { title: 'Cretic (101)', value: 'cretic' },
    { title: 'Choriambic (1001)', value: 'choriamb' },
    { title: 'Antispastic (0110)', value: 'antispast' },
    { title: 'First Paeon (1000)', value: 'first paeon' },
    { title: 'Second Paeon (0100)', value: 'second paeon' },
    { title: 'Third Paeon (0010)', value: 'third paeon' },
    { title: 'Fourth Paeon (0001)', value: 'fourth paeon' }
  ];

  const { meter } = await prompts({
    type: 'select',
    name: 'meter',
    message: 'Filter by meter (poetic fit):',
    choices: [
      ...meterOptions,
      { title: chalk.gray('No meter filter'), value: 'none' }
    ]
  });

  if (meter === undefined) return;

  const searchRegex = new RegExp(matchStart ? '^' + pattern.trim().toLowerCase() : pattern.trim().toLowerCase());
  const allWords = nounsing.pronunciations.map(p => p[0]);
  const uniqueWords = [...new Set(allWords)];

  const matches: string[] = [];
  for (const w of uniqueWords) {
    if (searchRegex.test(w)) {
      if (meter !== 'none') {
        const foot = meter as nounsing.PoeticMeter;
        if (nounsing.poeticFit(w, foot)) {
          matches.push(w);
        }
      } else {
        matches.push(w);
      }
    }
  }

  const label = meter !== 'none' ? `pattern+meter matches` : `matches`;
  const sliced = await promptSlice(matches.length, label, matches);
  console.log(chalk.green(`\n${label} (showing ${sliced.length}):`));
  for (let i = 0; i < sliced.length; i += 5) {
    console.log('  ' + sliced.slice(i, i + 5).join(', '));
  }
  console.log('');
}

async function searchMeter() {
  const { stressPattern } = await prompts({
    type: 'text',
    name: 'stressPattern',
    message: 'Enter stress pattern regex (e.g. 001$ for anapests, ^10 for trochees):'
  });
  if (!stressPattern || ['exit', 'quit', 'back'].includes(stressPattern.trim().toLowerCase())) return;

  const results = nounsing.searchStresses(stressPattern.trim());

  const sliced = await promptSlice(results.length, 'words', results);
  console.log(chalk.green(`\nMeter matches for "${stressPattern}" (showing ${sliced.length}):`));
  for (let i = 0; i < sliced.length; i += 5) {
    console.log('  ' + sliced.slice(i, i + 5).join(', '));
  }
  console.log('');
}

async function searchRegex() {
  const { phoneticRegex } = await prompts({
    type: 'text',
    name: 'phoneticRegex',
    message: 'Enter phonetic regex pattern (e.g. ^S K L, or \\bIH.*IH\\b):'
  });
  if (!phoneticRegex || ['exit', 'quit', 'back'].includes(phoneticRegex.trim().toLowerCase())) return;

  const results = nounsing.search(phoneticRegex.trim());

  const sliced = await promptSlice(results.length, 'words', results);
  console.log(chalk.green(`\nPhonetic regex matches (showing ${sliced.length}):`));
  for (let i = 0; i < sliced.length; i += 5) {
    console.log('  ' + sliced.slice(i, i + 5).join(', '));
  }
  console.log('');
}

async function searchCommon() {
  const { phrase } = await prompts({
    type: 'text',
    name: 'phrase',
    message: 'Enter a phrase to analyze for most common sounds:'
  });
  if (!phrase || ['exit', 'quit', 'back'].includes(phrase.trim().toLowerCase())) return;

  const topPhones = nounsing.mostCommonPhones(phrase.trim(), 13);
  console.log(chalk.bgBlue.white.bold('\n MOST COMMON PHONES '));
  if (topPhones.length === 0) {
    console.log(chalk.gray('No recognized words found in the dictionary.\n'));
    return;
  }

  const words = phrase.trim().toLowerCase().split(/\s+/);
  const wordPhonesMap: Array<{ word: string; phones: string[] }> = [];
  for (const w of words) {
    const clean = w.replace(/[^a-z']/g, '');
    const ps = nounsing.phonesForWord(clean);
    if (ps.length > 0) {
      wordPhonesMap.push({ word: clean, phones: ps[0].split(' ') });
    } else {
      wordPhonesMap.push({ word: w, phones: [] });
    }
  }

  for (const [phone, count] of topPhones) {
    const bar = '█'.repeat(Math.min(count, 40));
    // Build the word attribution list
    const attributions: string[] = [];
    let idx = 1;
    for (const wp of wordPhonesMap) {
      if (wp.phones.includes(phone)) {
        const coloredPhones = wp.phones.map(p =>
          p === phone ? chalk.red(p) : chalk.white(p)
        ).join(' ');
        attributions.push(`${chalk.dim(`${idx}.`)} ${coloredPhones}: ${chalk.hex('#C084FC')(wp.word)}`);
        idx++;
      }
    }
    const attrLine = attributions.length > 0 ? ` | ${attributions.join(' | ')}` : '';
    console.log(`  ${chalk.cyan(phone.padEnd(6))} ${chalk.yellow(String(count).padEnd(4))} ${chalk.dim(bar)}${attrLine}`);
  }
  console.log('');
}

// ============================================================================
// SUBMENU 3: PROCESS PHRASE / LINE / TEXT
// ============================================================================
async function promptPOSPrecision(): Promise<number> {
  console.log(chalk.dim('\nOptional: Constrain replacements to matching Part-of-Speech (PoS) tagged words to retain syntactic structure.'));
  const { precision } = await prompts({
    type: 'number',
    name: 'precision',
    message: 'Part of Speech Matching Precision (3 = Exact Penn tag, 2 = Medium, 1 = Loose, 0 = Off):',
    initial: 0,
    min: 0,
    max: 3,
    validate: (v: number) => v >= 0 && v <= 3 ? true : 'Must be 0-3'
  });
  return precision === undefined ? 0 : precision;
}

async function promptFreqThreshold(): Promise<number> {
  console.log(chalk.dim('\nOptional: Set Zipf frequency scale (1.00–7.00) threshold to exclude rare candidate words.'));
  console.log(chalk.dim('Values below 1.00 disable this filter. Words w/Zipf values "NA" are only included when the filter is disabled.'));
  const { threshold } = await prompts({
    type: 'number',
    name: 'threshold',
    message: 'Lexicon Normativity (Zipf) Threshold (<1.00 = disabled):',
    initial: 0,
    min: 0,
    max: 5.00,
    float: true
  });
  return threshold === undefined ? 0 : Math.round(threshold * 100) / 100;
}

async function processText() {
  console.log(chalk.dim('\nEnter a phrase, line, sentence, or paragraph below.\n'));

  const { text } = await prompts({
    type: 'text',
    name: 'text',
    message: 'Text:'
  });

  if (!text || ['exit', 'quit', 'back'].includes(text.trim().toLowerCase())) return;

  const inputText = text.trim();

  while (true) {
    const { procAction } = await prompts({
      type: 'select',
      name: 'procAction',
      message: 'Process text — choose operation:',
      choices: [
        { title: chalk.cyan('A. Syllable & Phoneme Counter'), value: 'count' },
        { title: chalk.green('B. Rewrite Text from Phonemes'), value: 'phonemeRewrite' },
        { title: chalk.yellow('C. Stress Pattern Rewrite'), value: 'stressRewrite' },
        { title: chalk.magenta('D. Rhyme Rewrite'), value: 'rhymeRewrite' },
        { title: chalk.gray('E. Back to Main Menu'), value: 'back' }
      ]
    });

    if (!procAction || procAction === 'back') return;

    console.log('');

    if (procAction === 'count') {
      const result = nounsing.countTextSyllables(inputText);
      console.log(chalk.bgCyan.black.bold(' SYLLABLE & PHONEME COUNT '));
      console.log(`Input:         "${chalk.dim(inputText)}"`);
      console.log(`Words:          ${chalk.yellow(inputText.split(/\s+/).length)}`);
      console.log(`Syllables:      ${chalk.green(result.syllables)}`);
      console.log(`Phonemes:       ${chalk.cyan(result.phonemes)}`);
      console.log(`Avg. per word:  ${chalk.dim((result.syllables / inputText.split(/\s+/).length || 0).toFixed(1))} syll / ${chalk.dim((result.phonemes / inputText.split(/\s+/).length || 0).toFixed(1))} phones`);

      // Build phonetic transcription with stress colors
      const words = inputText.split(/\s+/);
      const phoneParts: string[] = [];
      const syllParts: string[] = [];
      for (const w of words) {
        const clean = w.toLowerCase().replace(/[^a-z']/g, '');
        const phones = nounsing.phonesForWord(clean);
        if (phones.length > 0) {
          const phoneTokens = phones[0].split(' ');
          const coloredPhones = phoneTokens.map(p => {
            if (/[12]$/.test(p)) return p.slice(-1) === '1' ? chalk.red(p) : chalk.magenta(p);
            if (/[012]/.test(p)) return chalk.yellow(p);
            return chalk.hex('#8B5CF6')(p); // purple for consonants
          });
          phoneParts.push(coloredPhones.join(' '));
        } else {
          phoneParts.push(chalk.dim(w));
        }
        const ph = nounsing.phonemics(clean)?.[0];
        if (ph) {
          syllParts.push(chalk.hex('#7DD3FC')(ph.syllabification)); // light blue
        } else {
          syllParts.push(chalk.dim(w));
        }
      }
      console.log(chalk.bold('\n PHONETIC TRANSCRIPTION '));
      console.log(phoneParts.join(chalk.gray('  _  ')));
      console.log(chalk.bold('\n SYLLABIFIED PHRASE '));
      console.log(syllParts.join(chalk.gray('  _  ')));
      console.log(chalk.dim('\nColors: red=primary stress, magenta=secondary, yellow=unstressed, purple=consonant\n'));
    } else if (procAction === 'phonemeRewrite') {
      const precision = await promptPOSPrecision();
      const freqThresh = await promptFreqThreshold();
      const rewritten = nounsing.rewriteFromFirstTwoPhones(inputText, precision, freqThresh);
      console.log(chalk.bgGreen.black.bold('\n REWRITTEN BY FIRST TWO PHONES '));
      if (precision > 0) console.log(chalk.dim(`POS Precision: ${precision}`));
      if (freqThresh >= 1.0) console.log(chalk.dim(`Zipf Threshold: ${freqThresh.toFixed(2)}`));
      console.log(chalk.dim('Each word replaced by a random word sharing its first two phones.'));
      console.log(`Original:  ${chalk.gray(inputText)}`);
      console.log(`Rewritten: ${chalk.green(rewritten)}\n`);
    } else if (procAction === 'stressRewrite') {
      const precision = await promptPOSPrecision();
      const freqThresh = await promptFreqThreshold();
      const rewritten = nounsing.rewriteWithStressPattern(inputText, precision, freqThresh);
      console.log(chalk.bgYellow.black.bold('\n REWRITTEN BY STRESS PATTERN '));
      if (precision > 0) console.log(chalk.dim(`POS Precision: ${precision}`));
      if (freqThresh >= 1.0) console.log(chalk.dim(`Zipf Threshold: ${freqThresh.toFixed(2)}`));
      console.log(chalk.dim('Each word replaced by a random word sharing its exact stress pattern.'));
      console.log(`Original:  ${chalk.gray(inputText)}`);
      console.log(`Rewritten: ${chalk.yellow(rewritten)}\n`);
    } else if (procAction === 'rhymeRewrite') {
      const precision = await promptPOSPrecision();
      const freqThresh = await promptFreqThreshold();
      const rewritten = nounsing.rewriteWithRhymes(inputText, precision, freqThresh);
      console.log(chalk.bgMagenta.white.bold('\n REWRITTEN BY RHYMES '));
      if (precision > 0) console.log(chalk.dim(`POS Precision: ${precision}`));
      if (freqThresh >= 1.0) console.log(chalk.dim(`Zipf Threshold: ${freqThresh.toFixed(2)}`));
      console.log(chalk.dim('Each word replaced by a random rhyming word.'));
      console.log(`Original:  ${chalk.gray(inputText)}`);
      console.log(`Rewritten: ${chalk.magenta(rewritten)}\n`);
    }
  }
}

main().catch(err => {
  console.error(chalk.red('An error occurred:'), err);
});
