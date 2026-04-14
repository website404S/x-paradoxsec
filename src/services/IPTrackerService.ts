// src/services/IPTrackerService.ts
// Real IP geolocation via ip-api.com (free, no API key needed)

import axios from 'axios';

export interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  proxy: boolean;
  hosting: boolean;
  mobile: boolean;
  query: string;
  status: 'success' | 'fail';
  message?: string;
}

// Track any IP address or domain
export async function trackIP(target: string): Promise<IPInfo> {
  const clean = target.trim().replace(/^https?:\/\//, '').split('/')[0];
  const url = `http://ip-api.com/json/${clean}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,mobile,query`;

  const resp = await axios.get<IPInfo>(url, { timeout: 8000 });
  return resp.data;
}

// Get YOUR own public IP info
export async function getMyIP(): Promise<IPInfo> {
  const resp = await axios.get<IPInfo>(
    'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,mobile,query',
    { timeout: 8000 }
  );
  return resp.data;
}

// Bulk IP lookup (up to 100)
export async function bulkTrack(ips: string[]): Promise<IPInfo[]> {
  const resp = await axios.post<IPInfo[]>(
    'http://ip-api.com/batch?fields=status,query,country,regionName,city,isp,org,proxy,hosting,mobile',
    ips.slice(0, 100).map((q) => ({ query: q })),
    { timeout: 10000 }
  );
  return resp.data;
}
