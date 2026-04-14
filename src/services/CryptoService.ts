// src/services/CryptoService.ts
// Real cryptographic operations via crypto-js

import CryptoJS from 'crypto-js';

// ── Hashing ────────────────────────────────────────────────────────────────
export function hashMD5(input: string): string {
  return CryptoJS.MD5(input).toString();
}

export function hashSHA1(input: string): string {
  return CryptoJS.SHA1(input).toString();
}

export function hashSHA224(input: string): string {
  return CryptoJS.SHA224(input).toString();
}

export function hashSHA256(input: string): string {
  return CryptoJS.SHA256(input).toString();
}

export function hashSHA384(input: string): string {
  return CryptoJS.SHA384(input).toString();
}

export function hashSHA512(input: string): string {
  return CryptoJS.SHA512(input).toString();
}

export function hashSHA3(input: string, bits: 224 | 256 | 384 | 512 = 512): string {
  return CryptoJS.SHA3(input, { outputLength: bits }).toString();
}

export function hashRIPEMD160(input: string): string {
  return CryptoJS.RIPEMD160(input).toString();
}

export function hmacSHA256(message: string, key: string): string {
  return CryptoJS.HmacSHA256(message, key).toString();
}

export function hmacSHA512(message: string, key: string): string {
  return CryptoJS.HmacSHA512(message, key).toString();
}

// ── All hashes at once ─────────────────────────────────────────────────────
export interface HashResults {
  md5: string;
  sha1: string;
  sha224: string;
  sha256: string;
  sha384: string;
  sha512: string;
  ripemd160: string;
}

export function hashAll(input: string): HashResults {
  return {
    md5: hashMD5(input),
    sha1: hashSHA1(input),
    sha224: hashSHA224(input),
    sha256: hashSHA256(input),
    sha384: hashSHA384(input),
    sha512: hashSHA512(input),
    ripemd160: hashRIPEMD160(input),
  };
}

// ── Encoding / Decoding ────────────────────────────────────────────────────
export function encodeBase64(input: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
}

export function decodeBase64(input: string): string {
  try {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(input));
  } catch {
    return 'Invalid Base64 input';
  }
}

export function encodeHex(input: string): string {
  return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(input));
}

export function decodeHex(input: string): string {
  try {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(input));
  } catch {
    return 'Invalid Hex input';
  }
}

export function encodeURL(input: string): string {
  return encodeURIComponent(input);
}

export function decodeURL(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return 'Invalid URL-encoded input';
  }
}

export function encodeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function decodeHTML(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

export function toBinary(input: string): string {
  return input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

export function fromBinary(input: string): string {
  try {
    return input.trim().split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
  } catch {
    return 'Invalid binary input';
  }
}

export function toROT13(input: string): string {
  return input.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// ── AES Encryption ─────────────────────────────────────────────────────────
export function aesEncrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function aesDecrypt(ciphertext: string, key: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8) || 'Decryption failed (wrong key?)';
  } catch {
    return 'Decryption failed';
  }
}

// ── Password Strength ──────────────────────────────────────────────────────
export interface PasswordAnalysis {
  score: number;        // 0–100
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  entropy: number;
  crackTime: string;
  issues: string[];
  suggestions: string[];
  charsetSize: number;
}

export function analyzePassword(password: string): PasswordAnalysis {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSpecial) charsetSize += 32;

  const entropy = password.length * Math.log2(charsetSize || 1);

  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasDigit) score += 10;
  if (hasSpecial) score += 20;
  if (!/(.)\1{2,}/.test(password)) score += 5;
  if (!/^[a-z]+$|^[A-Z]+$|^[0-9]+$/.test(password)) score += 5;

  // Penalties
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'monkey', 'admin'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    score -= 30;
    issues.push('Contains a common password pattern');
  }
  if (password.length < 8) issues.push('Too short (minimum 8 characters)');
  if (!hasLower) suggestions.push('Add lowercase letters');
  if (!hasUpper) suggestions.push('Add uppercase letters');
  if (!hasDigit) suggestions.push('Add numbers');
  if (!hasSpecial) suggestions.push('Add special characters (!@#$%^&*)');
  if (password.length < 12) suggestions.push('Make it at least 12 characters');

  score = Math.max(0, Math.min(100, score));

  // Crack time estimation (rough)
  const guessesPerSecond = 1e10; // 10 billion/sec (GPU)
  const combinations = Math.pow(charsetSize, password.length);
  const seconds = combinations / guessesPerSecond;

  let crackTime: string;
  if (seconds < 1) crackTime = 'Instantly';
  else if (seconds < 60) crackTime = `${seconds.toFixed(0)} seconds`;
  else if (seconds < 3600) crackTime = `${(seconds / 60).toFixed(0)} minutes`;
  else if (seconds < 86400) crackTime = `${(seconds / 3600).toFixed(0)} hours`;
  else if (seconds < 2592000) crackTime = `${(seconds / 86400).toFixed(0)} days`;
  else if (seconds < 31536000) crackTime = `${(seconds / 2592000).toFixed(0)} months`;
  else if (seconds < 3153600000) crackTime = `${(seconds / 31536000).toFixed(0)} years`;
  else crackTime = 'Centuries+';

  const strength =
    score >= 80 ? 'Very Strong' :
    score >= 60 ? 'Strong' :
    score >= 40 ? 'Fair' :
    score >= 20 ? 'Weak' :
    'Very Weak';

  return { score, strength, entropy, crackTime, issues, suggestions, charsetSize };
}

// ── JWT Decoder ────────────────────────────────────────────────────────────
export interface JWTDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt?: string;
}

export function decodeJWT(token: string): JWTDecoded | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decode = (str: string) =>
      JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));

    const header = decode(parts[0]);
    const payload = decode(parts[1]);
    const signature = parts[2];

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? (payload.exp as number) < now : false;
    const expiresAt = payload.exp
      ? new Date((payload.exp as number) * 1000).toLocaleString()
      : undefined;

    return { header, payload, signature, isExpired, expiresAt };
  } catch {
    return null;
  }
}
