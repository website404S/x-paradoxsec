// src/services/URLScannerService.ts
// URL safety scanner using heuristics + Google Safe Browsing API (optional key)
// Falls back to local heuristics if no API key is set.

import axios from 'axios';

// ── Config ─────────────────────────────────────────────────────────────────
// Optional: add your Google Safe Browsing API key in env or config
const SAFE_BROWSING_KEY = ''; // Leave empty to use heuristics only
const SAFE_BROWSING_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

// ── Types ──────────────────────────────────────────────────────────────────
export type ThreatLevel = 'safe' | 'suspicious' | 'dangerous' | 'unknown';

export interface URLScanResult {
  url: string;
  threatLevel: ThreatLevel;
  reasons: string[];      // Human-readable findings
  score: number;          // 0–100 danger score
  checkedAt: number;
}

// ── Heuristic patterns ─────────────────────────────────────────────────────
const PHISHING_KEYWORDS = [
  'login', 'signin', 'account', 'verify', 'secure', 'update',
  'banking', 'paypal', 'apple-id', 'amazon', 'netflix', 'confirm',
  'password', 'credential', 'auth', 'wallet', 'crypto', 'bitcoin',
];

const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click',
  '.download', '.loan', '.win', '.racing', '.date', '.faith',
];

const KNOWN_MALWARE_PATTERNS = [
  /bit\.ly\//i,
  /tinyurl\.com\//i,
  /goo\.gl\//i,
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // Raw IP address as host
  /\.(exe|apk|bat|cmd|vbs|ps1|msi|dmg)$/i, // Executable extensions
];

// ── Heuristic scanner ──────────────────────────────────────────────────────
function runHeuristics(url: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const full = url.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    // Check HTTP (not HTTPS)
    if (parsed.protocol === 'http:') {
      score += 15;
      reasons.push('⚠️ Not using HTTPS (unencrypted)');
    }

    // Suspicious TLD
    SUSPICIOUS_TLDS.forEach((tld) => {
      if (hostname.endsWith(tld)) {
        score += 25;
        reasons.push(`🚩 Suspicious TLD: ${tld}`);
      }
    });

    // Phishing keywords in URL
    const foundKeywords = PHISHING_KEYWORDS.filter(
      (kw) => full.includes(kw)
    );
    if (foundKeywords.length > 0) {
      score += Math.min(foundKeywords.length * 10, 30);
      reasons.push(`🎣 Phishing keywords: ${foundKeywords.join(', ')}`);
    }

    // Known patterns
    KNOWN_MALWARE_PATTERNS.forEach((pattern) => {
      if (pattern.test(full)) {
        score += 20;
        reasons.push(`🔗 Suspicious pattern detected in URL`);
      }
    });

    // Excessive subdomains (e.g. paypal.com.evil.tk)
    const subdomainCount = hostname.split('.').length - 2;
    if (subdomainCount > 3) {
      score += 20;
      reasons.push(`🌐 Excessive subdomains (${subdomainCount}) — possible spoofing`);
    }

    // Very long URL
    if (url.length > 200) {
      score += 10;
      reasons.push('📏 Unusually long URL');
    }

    // Punycode / Unicode tricks
    if (hostname.includes('xn--')) {
      score += 15;
      reasons.push('⚠️ Punycode domain — possible homograph attack');
    }

    if (score === 0) {
      reasons.push('✅ No suspicious indicators found');
    }
  } catch {
    score = 10;
    reasons.push('⚠️ Could not parse URL');
  }

  return { score: Math.min(score, 100), reasons };
}

// ── Google Safe Browsing check ─────────────────────────────────────────────
async function checkSafeBrowsing(url: string): Promise<string[]> {
  if (!SAFE_BROWSING_KEY) return [];

  try {
    const response = await axios.post(
      `${SAFE_BROWSING_URL}?key=${SAFE_BROWSING_KEY}`,
      {
        client: { clientId: 'x-toolkit', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      },
      { timeout: 6000 }
    );

    const matches: Array<{ threatType: string }> = response.data.matches ?? [];
    return matches.map((m) => `🛡️ Google Safe Browsing: ${m.threatType}`);
  } catch {
    return []; // Silently fail — heuristics still run
  }
}

// ── Main scan function ─────────────────────────────────────────────────────
export async function scanURL(url: string): Promise<URLScanResult> {
  const { score: hScore, reasons: hReasons } = runHeuristics(url);
  const sbReasons = await checkSafeBrowsing(url);

  const allReasons = [...hReasons, ...sbReasons];
  const finalScore = Math.min(hScore + sbReasons.length * 30, 100);

  let threatLevel: ThreatLevel;
  if (sbReasons.length > 0 || finalScore >= 70) {
    threatLevel = 'dangerous';
  } else if (finalScore >= 35) {
    threatLevel = 'suspicious';
  } else if (finalScore > 0) {
    threatLevel = 'suspicious';
  } else {
    threatLevel = 'safe';
  }

  return {
    url,
    threatLevel,
    reasons: allReasons,
    score: finalScore,
    checkedAt: Date.now(),
  };
}
