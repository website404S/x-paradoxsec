// src/services/NetworkService.ts
// Real network info via @react-native-community/netinfo + expo-network

import NetInfo, { NetInfoState, NetInfoWifiState } from '@react-native-community/netinfo';
import * as Network from 'expo-network';
import * as Device from 'expo-device';

export interface NetworkDetails {
  // Connectivity
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;

  // WiFi details (real - when connected to WiFi)
  ssid: string | null;
  bssid: string | null;
  ipAddress: string | null;
  subnet: string | null;
  frequency: number | null;
  signalStrength: number | null;
  linkSpeed: number | null;

  // Public IP
  publicIP: string;

  // DNS
  dnsServers: string[];
}

export async function getNetworkDetails(): Promise<NetworkDetails> {
  const [state, publicIP] = await Promise.all([
    NetInfo.fetch(),
    Network.getIpAddressAsync().catch(() => 'Unavailable'),
  ]);

  const wifi = state as NetInfoWifiState;
  const details = wifi.details as any;

  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,

    ssid: details?.ssid ?? null,
    bssid: details?.bssid ?? null,
    ipAddress: details?.ipAddress ?? null,
    subnet: details?.subnet ?? null,
    frequency: details?.frequency ?? null,
    signalStrength: details?.strength ?? null,
    linkSpeed: details?.linkSpeed ?? null,

    publicIP,
    dnsServers: [], // Not accessible via JS in Android sandbox
  };
}

// Real connectivity test to multiple endpoints
export interface PingResult {
  host: string;
  reachable: boolean;
  latencyMs: number;
  statusCode?: number;
}

export async function pingHost(host: string): Promise<PingResult> {
  const url = host.startsWith('http') ? host : `https://${host}`;
  const start = Date.now();
  try {
    const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return { host, reachable: true, latencyMs: Date.now() - start, statusCode: resp.status };
  } catch {
    return { host, reachable: false, latencyMs: Date.now() - start };
  }
}

// Subscribe to network changes
export function subscribeNetworkChanges(callback: (state: NetInfoState) => void) {
  return NetInfo.addEventListener(callback);
}
