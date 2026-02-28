import { normalizeGuess, checkAlternativeSpellings } from '../lib/normalization';

describe(' normalization and alias matching', () => {
  it('normalizes guesses correctly', () => {
    expect(normalizeGuess('T.B.')).toBe('tb');
    expect(normalizeGuess(' Myocardial Infarction ')).toBe('myocardial infarction');
    expect(normalizeGuess('COVID-19!')).toBe('covid19');
    expect(normalizeGuess('systemic lupus erythematosus')).toBe('systemic lupus erythematosus');
  });

  it('checks alternative spellings correctly', () => {
    const aliases = ['MI', 'heart attack', 'stemi', 'nstemi'];
    const expected = normalizeGuess('Myocardial Infarction');
    
    // Exact match
    expect(checkAlternativeSpellings(normalizeGuess('Myocardial Infarction'), expected, aliases)).toBe(true);
    
    // Alias match
    expect(checkAlternativeSpellings(normalizeGuess('heart attack'), expected, aliases)).toBe(true);
    expect(checkAlternativeSpellings(normalizeGuess(' STEMI '), expected, aliases)).toBe(true);
    expect(checkAlternativeSpellings(normalizeGuess('m.i.'), expected, aliases)).toBe(true);
    
    // Wrong guess
    expect(checkAlternativeSpellings(normalizeGuess('pulmonary embolism'), expected, aliases)).toBe(false);
  });
});
