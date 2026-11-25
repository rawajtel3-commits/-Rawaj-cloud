/**
 * Cryptographically Secure Password Generator & Entropy Evaluator
 * Powered by Web Crypto API (crypto.getRandomValues)
 */

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 - 100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'ultra';
  labelAr: string;
  labelEn: string;
  entropyBits: number;
  crackTimeAr: string;
  crackTimeEn: string;
  color: string;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?~';

// Ambiguous characters: 0, O, o, 1, l, I, |, `
const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', '1', 'l', 'I', '|', '`', '\'', '"']);

const SECURE_PASSPHRASE_WORDS = [
  'falcon', 'summit', 'nebula', 'cipher', 'quantum', 'shield', 'phoenix',
  'crystal', 'matrix', 'beacon', 'aurora', 'vertex', 'horizon', 'granite',
  'dynamo', 'zenith', 'pulse', 'canyon', 'vortex', 'anchor', 'timber',
  'glacier', 'orbit', 'solstice', 'safeguard', 'bastion', 'strata', 'echo',
  'catalyst', 'ironclad', 'sentinel', 'meridian', 'valiant', 'spectrum',
  'titanium', 'obsidian', 'citadel', 'vanguard', 'keystone', 'cascade'
];

/**
 * Generates a cryptographically strong random password using Web Crypto API
 */
export function generateVaultPassword(options: PasswordGeneratorOptions): string {
  let charPool = '';
  const requiredChars: string[] = [];

  const filterAmbiguous = (str: string) => {
    if (!options.excludeAmbiguous) return str;
    return str.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('');
  };

  const upper = filterAmbiguous(UPPERCASE_CHARS);
  const lower = filterAmbiguous(LOWERCASE_CHARS);
  const numbers = filterAmbiguous(NUMBER_CHARS);
  const symbols = filterAmbiguous(SYMBOL_CHARS);

  if (options.includeUppercase && upper.length > 0) {
    charPool += upper;
    requiredChars.push(getRandomChar(upper));
  }
  if (options.includeLowercase && lower.length > 0) {
    charPool += lower;
    requiredChars.push(getRandomChar(lower));
  }
  if (options.includeNumbers && numbers.length > 0) {
    charPool += numbers;
    requiredChars.push(getRandomChar(numbers));
  }
  if (options.includeSymbols && symbols.length > 0) {
    charPool += symbols;
    requiredChars.push(getRandomChar(symbols));
  }

  // Fallback if user unchecks all
  if (charPool.length === 0) {
    charPool = lower;
    requiredChars.push(getRandomChar(lower));
  }

  const length = Math.max(requiredChars.length, options.length);
  const remainingCount = length - requiredChars.length;

  const resultChars: string[] = [...requiredChars];
  if (remainingCount > 0) {
    const randomArray = new Uint32Array(remainingCount);
    crypto.getRandomValues(randomArray);
    for (let i = 0; i < remainingCount; i++) {
      resultChars.push(charPool[randomArray[i] % charPool.length]);
    }
  }

  // Cryptographically shuffle array using Fisher-Yates
  return secureShuffle(resultChars).join('');
}

/**
 * Generates a memorable multi-word passphrase (Diceware style)
 */
export function generateDicewarePassphrase(wordCount: number = 4, includeNumber: boolean = true): string {
  const chosenWords: string[] = [];
  const randomIndices = new Uint32Array(wordCount);
  crypto.getRandomValues(randomIndices);

  for (let i = 0; i < wordCount; i++) {
    const word = SECURE_PASSPHRASE_WORDS[randomIndices[i] % SECURE_PASSPHRASE_WORDS.length];
    // Capitalize first letter of each word
    chosenWords.push(word.charAt(0).toUpperCase() + word.slice(1));
  }

  let phrase = chosenWords.join('-');
  if (includeNumber) {
    const numBuffer = new Uint16Array(1);
    crypto.getRandomValues(numBuffer);
    const suffixNum = (numBuffer[0] % 900) + 100;
    phrase += `-${suffixNum}`;
  }
  return phrase;
}

/**
 * Helper to pick a single secure random character from a given string
 */
function getRandomChar(source: string): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return source[buf[0] % source.length];
}

/**
 * Fisher-Yates shuffle with Web Crypto random values
 */
function secureShuffle(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Computes Shannon-style entropy and estimated brute force resistance
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password || password.length === 0) {
    return {
      score: 0,
      level: 'weak',
      labelAr: 'فارغ',
      labelEn: 'Empty',
      entropyBits: 0,
      crackTimeAr: 'لحظي',
      crackTimeEn: 'Instant',
      color: '#EF4444',
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  // Base entropy calculation in bits
  const entropy = Math.round(password.length * Math.log2(Math.max(2, poolSize)));

  // Calculate score (0-100)
  // 128 bits is military grade E2EE
  const score = Math.min(100, Math.round((entropy / 128) * 100));

  if (entropy < 40) {
    return {
      score,
      level: 'weak',
      labelAr: 'ضعيف جداً',
      labelEn: 'Very Weak',
      entropyBits: entropy,
      crackTimeAr: 'ثوانٍ معدودة',
      crackTimeEn: 'Few seconds',
      color: '#EF4444',
    };
  } else if (entropy < 60) {
    return {
      score,
      level: 'fair',
      labelAr: 'متوسط',
      labelEn: 'Fair',
      entropyBits: entropy,
      crackTimeAr: 'بضع ساعات',
      crackTimeEn: 'Few hours',
      color: '#F59E0B',
    };
  } else if (entropy < 80) {
    return {
      score,
      level: 'good',
      labelAr: 'جيد وآمن',
      labelEn: 'Good',
      entropyBits: entropy,
      crackTimeAr: 'عدة أشهر',
      crackTimeEn: 'Several months',
      color: '#3B82F6',
    };
  } else if (entropy < 110) {
    return {
      score,
      level: 'strong',
      labelAr: 'قوي ومحصن',
      labelEn: 'Strong',
      entropyBits: entropy,
      crackTimeAr: 'مئات السنين',
      crackTimeEn: 'Centuries',
      color: '#1AD062',
    };
  } else {
    return {
      score,
      level: 'ultra',
      labelAr: 'فائق الأمان (عسكري E2EE)',
      labelEn: 'Military Grade E2EE',
      entropyBits: entropy,
      crackTimeAr: 'ملايين السنين',
      crackTimeEn: 'Millions of years',
      color: '#4E115A',
    };
  }
}
