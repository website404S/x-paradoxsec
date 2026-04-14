// src/services/SecurityToolsService.ts
// Real SSL checker, HTTP header inspector, port scanner

import axios from 'axios';

// ── SSL Certificate Checker ────────────────────────────────────────────────
export interface SSLInfo {
  domain: string;
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  grade: 'A' | 'B' | 'C' | 'F' | 'Unknown';
  protocol: string;
  error?: string;
}

export async function checkSSL(domain: string): Promise<SSLInfo> {
  const clean = domain.replace(/^https?:\/\//, '').split('/')[0];

  try {
    // Use SSL Labs API (free, no key needed)
    const resp = await axios.get(
      `https://api.ssllabs.com/api/v3/analyze?host=${clean}&all=done&ignoreMismatch=on`,
      { timeout: 15000 }
    );
    const data = resp.data;
    const endpoint = data.endpoints?.[0];

    // Also fetch cert details from crt.sh
    const certResp = await axios.get(
      `https://crt.sh/?q=${clean}&output=json`,
      { timeout: 8000 }
    ).catch(() => null);

    let issuer = 'Unknown';
    let validFrom = 'Unknown';
    let validTo = 'Unknown';
    let daysRemaining = 0;

    if (certResp?.data?.[0]) {
      const cert = certResp.data[0];
      issuer = cert.issuer_name ?? 'Unknown';
      validFrom = cert.not_before ?? 'Unknown';
      validTo = cert.not_after ?? 'Unknown';
      if (cert.not_after) {
        daysRemaining = Math.floor((new Date(cert.not_after).getTime() - Date.now()) / 86400000);
      }
    }

    return {
      domain: clean,
      valid: data.status === 'READY' && endpoint?.grade !== 'F',
      issuer,
      subject: clean,
      validFrom,
      validTo,
      daysRemaining,
      grade: endpoint?.grade ?? 'Unknown',
      protocol: 'TLS',
    };
  } catch {
    // Fallback: just check if HTTPS works
    try {
      await axios.head(`https://${clean}`, { timeout: 5000 });
      return {
        domain: clean,
        valid: true,
        issuer: 'Unknown (API unavailable)',
        subject: clean,
        validFrom: 'Unknown',
        validTo: 'Unknown',
        daysRemaining: -1,
        grade: 'Unknown',
        protocol: 'HTTPS',
      };
    } catch (e: any) {
      return {
        domain: clean,
        valid: false,
        issuer: 'N/A',
        subject: clean,
        validFrom: 'N/A',
        validTo: 'N/A',
        daysRemaining: 0,
        grade: 'F',
        protocol: 'Unknown',
        error: e.message,
      };
    }
  }
}

// ── HTTP Header Inspector ──────────────────────────────────────────────────
export interface HTTPHeaderResult {
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  latencyMs: number;
  securityHeaders: SecurityHeaderCheck[];
  server: string;
  contentType: string;
  redirectUrl?: string;
}

export interface SecurityHeaderCheck {
  name: string;
  present: boolean;
  value: string | null;
  risk: 'high' | 'medium' | 'low';
  description: string;
}

const SECURITY_HEADERS_CONFIG = [
  { name: 'Strict-Transport-Security', risk: 'high' as const, description: 'Enforces HTTPS connections' },
  { name: 'Content-Security-Policy', risk: 'high' as const, description: 'Prevents XSS attacks' },
  { name: 'X-Frame-Options', risk: 'medium' as const, description: 'Prevents clickjacking' },
  { name: 'X-Content-Type-Options', risk: 'medium' as const, description: 'Prevents MIME sniffing' },
  { name: 'Referrer-Policy', risk: 'low' as const, description: 'Controls referrer info' },
  { name: 'Permissions-Policy', risk: 'low' as const, description: 'Controls browser features' },
  { name: 'X-XSS-Protection', risk: 'medium' as const, description: 'XSS filter (legacy)' },
  { name: 'Cache-Control', risk: 'low' as const, description: 'Caching behavior' },
];

export async function inspectHTTPHeaders(url: string): Promise<HTTPHeaderResult> {
  const target = url.startsWith('http') ? url : `https://${url}`;
  const start = Date.now();

  // Use a CORS proxy for web, direct for native
  const resp = await axios.get(target, {
    timeout: 10000,
    maxRedirects: 5,
    validateStatus: () => true,
  });

  const latencyMs = Date.now() - start;
  const headers: Record<string, string> = {};
  Object.entries(resp.headers).forEach(([k, v]) => {
    headers[k] = Array.isArray(v) ? v.join(', ') : String(v ?? '');
  });

  const securityHeaders: SecurityHeaderCheck[] = SECURITY_HEADERS_CONFIG.map(({ name, risk, description }) => ({
    name,
    present: name.toLowerCase() in resp.headers,
    value: headers[name.toLowerCase()] ?? null,
    risk,
    description,
  }));

  return {
    url: target,
    statusCode: resp.status,
    statusText: resp.statusText,
    headers,
    latencyMs,
    securityHeaders,
    server: headers['server'] ?? 'Unknown',
    contentType: headers['content-type'] ?? 'Unknown',
  };
}

// ── Port Scanner (TCP connect via fetch — works within Android sandbox) ────
export interface PortScanResult {
  port: number;
  open: boolean;
  service: string;
  latencyMs: number;
}

const WELL_KNOWN_PORTS: Record<number, string> = {
  21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
  53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
  443: 'HTTPS', 445: 'SMB', 465: 'SMTPS', 587: 'SMTP',
  993: 'IMAPS', 995: 'POP3S', 1433: 'MSSQL', 1521: 'Oracle',
  3000: 'Dev Server', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
  5900: 'VNC', 6379: 'Redis', 8080: 'HTTP Alt', 8443: 'HTTPS Alt',
  8888: 'Jupyter', 9200: 'Elasticsearch', 27017: 'MongoDB',
};

export async function scanPort(host: string, port: number): Promise<PortScanResult> {
  const start = Date.now();
  const protocol = [443, 8443, 8080].includes(port) ? 'https' : 'http';
  const url = `${protocol}://${host}:${port}`;

  try {
    await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000),
    });
    return { port, open: true, service: WELL_KNOWN_PORTS[port] ?? 'Unknown', latencyMs: Date.now() - start };
  } catch (e: any) {
    // If we get a response (even error), port is open
    const isOpen = e?.message?.includes('Network request failed') === false &&
                   e?.name !== 'AbortError' &&
                   !e?.message?.includes('timeout');
    return { port, open: isOpen, service: WELL_KNOWN_PORTS[port] ?? 'Unknown', latencyMs: Date.now() - start };
  }
}

export async function scanCommonPorts(host: string): Promise<PortScanResult[]> {
  const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3000, 3306, 3389, 5432, 6379, 8080, 8443, 27017];
  const results = await Promise.all(commonPorts.map((p) => scanPort(host, p)));
  return results.sort((a, b) => a.port - b.port);
}
