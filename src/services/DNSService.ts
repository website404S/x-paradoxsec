// src/services/DNSService.ts
// DNS lookup via Cloudflare DNS-over-HTTPS (DoH) — no native DNS libs needed

import axios from 'axios';

// ── Types ──────────────────────────────────────────────────────────────────
export interface DNSRecord {
  type: string;   // e.g. A, AAAA, MX, TXT, CNAME, NS
  name: string;
  value: string;
  ttl: number;
}

export interface DNSResult {
  domain: string;
  ip: string[];
  records: DNSRecord[];
  latencyMs: number;
  error?: string;
}

// DNS record type numbers → human-readable labels
const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
};

// ── Main lookup function ───────────────────────────────────────────────────
export async function lookupDNS(domain: string): Promise<DNSResult> {
  const cleanDomain = domain.trim().replace(/^https?:\/\//, '').split('/')[0];
  const startTime = Date.now();
  const records: DNSRecord[] = [];
  const ips: string[] = [];

  // Record types to query
  const typesToQuery = [1, 28, 15, 16, 2, 5]; // A, AAAA, MX, TXT, NS, CNAME

  try {
    // Run all queries in parallel
    const results = await Promise.allSettled(
      typesToQuery.map((typeNum) =>
        axios.get('https://cloudflare-dns.com/dns-query', {
          params: { name: cleanDomain, type: typeNum },
          headers: { Accept: 'application/dns-json' },
          timeout: 8000,
        })
      )
    );

    const latencyMs = Date.now() - startTime;

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        const data = result.value.data;
        const typeLabel = DNS_TYPE_MAP[typesToQuery[idx]] ?? String(typesToQuery[idx]);

        (data.Answer ?? []).forEach((ans: { name: string; data: string; TTL: number }) => {
          const record: DNSRecord = {
            type: typeLabel,
            name: ans.name,
            value: ans.data,
            ttl: ans.TTL,
          };
          records.push(record);

          // Collect IPs from A/AAAA records
          if (typeLabel === 'A' || typeLabel === 'AAAA') {
            ips.push(ans.data);
          }
        });
      }
    });

    return {
      domain: cleanDomain,
      ip: [...new Set(ips)],
      records,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      domain: cleanDomain,
      ip: [],
      records: [],
      latencyMs,
      error: `DNS lookup failed: ${message}`,
    };
  }
}
