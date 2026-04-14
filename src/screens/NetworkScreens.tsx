// src/screens/NetworkScreens.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { getNetworkDetails, NetworkDetails, pingHost } from '../services/NetworkService';
import { scanCommonPorts, scanPort, PortScanResult, inspectHTTPHeaders, HTTPHeaderResult, checkSSL, SSLInfo } from '../services/SecurityToolsService';
import { GlassCard, Btn, PageHeader, InfoRow, Badge, SectionTitle, Tag } from '../components/UI';
import { C, F, S, R } from '../theme';
import { useStore } from '../store/useStore';

// ── NETWORK INFO ───────────────────────────────────────────────────────────
export const NetworkInfoScreen: React.FC = () => {
  const [info, setInfo] = useState<NetworkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [pingResults, setPingResults] = useState<{ host: string; reachable: boolean; latencyMs: number }[]>([]);

  const load = async () => {
    setLoading(true);
    const data = await getNetworkDetails();
    setInfo(data);
    setLoading(false);

    // Ping common hosts
    const hosts = ['8.8.8.8', '1.1.1.1', 'google.com', 'cloudflare.com'];
    const results = await Promise.all(hosts.map(pingHost));
    setPingResults(results);
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <PageHeader title="Network Info" subtitle="Real WiFi & network data" icon="📶" accent={C.pink} />
      <View style={s.body}>
        <Btn label="REFRESH" onPress={load} variant="ghost" fullWidth />
        {loading ? <ActivityIndicator color={C.pink} size="large" style={{ marginTop: 40 }} /> : info && (
          <>
            <SectionTitle label="Connectivity" />
            <GlassCard accent={info.isConnected ? C.success : C.danger}>
              <InfoRow label="Status" value={info.isConnected ? '🟢 Connected' : '🔴 Disconnected'} valueColor={info.isConnected ? C.success : C.danger} />
              <InfoRow label="Type" value={info.type.toUpperCase()} />
              <InfoRow label="Internet" value={info.isInternetReachable ? 'Reachable' : 'Unreachable'} />
            </GlassCard>

            {info.type === 'wifi' && (
              <>
                <SectionTitle label="WiFi Details" />
                <GlassCard accent={C.pink}>
                  <InfoRow label="SSID" value={info.ssid ?? 'Unavailable (needs location perm)'} valueColor={C.pink} />
                  <InfoRow label="BSSID" value={info.bssid ?? 'Unavailable'} mono />
                  <InfoRow label="Local IP" value={info.ipAddress ?? 'Unknown'} valueColor={C.cyan} mono />
                  <InfoRow label="Subnet" value={info.subnet ?? 'Unknown'} mono />
                  {info.frequency !== null && <InfoRow label="Frequency" value={`${info.frequency} MHz`} />}
                  {info.linkSpeed !== null && <InfoRow label="Link Speed" value={`${info.linkSpeed} Mbps`} />}
                </GlassCard>
              </>
            )}

            <SectionTitle label="Public IP" />
            <GlassCard accent={C.violet}>
              <InfoRow label="Public IP" value={info.publicIP} valueColor={C.violetBright} mono />
            </GlassCard>

            <SectionTitle label="Connectivity Test" />
            {pingResults.map((r) => (
              <GlassCard key={r.host} accent={r.reachable ? C.success : C.danger} padding={S.sm}>
                <View style={s.pingRow}>
                  <Text style={s.pingHost}>{r.host}</Text>
                  <Text style={[s.pingStatus, { color: r.reachable ? C.success : C.danger }]}>
                    {r.reachable ? `✓ ${r.latencyMs}ms` : '✗ Unreachable'}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── PORT SCANNER ───────────────────────────────────────────────────────────
export const PortScannerScreen: React.FC = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PortScanResult[]>([]);
  const [progress, setProgress] = useState(0);
  const addHistory = useStore((s) => s.addHistory);

  const scanAll = async () => {
    if (!host.trim()) return Alert.alert('Error', 'Enter a host.');
    setLoading(true);
    setResults([]);
    setProgress(0);
    const ports = [21,22,23,25,53,80,110,143,443,445,3000,3306,3389,5432,6379,8080,8443,27017];
    const res: PortScanResult[] = [];
    for (let i = 0; i < ports.length; i++) {
      const r = await scanPort(host.trim(), ports[i]);
      res.push(r);
      setResults([...res]);
      setProgress(Math.round(((i + 1) / ports.length) * 100));
    }
    const openCount = res.filter((r) => r.open).length;
    addHistory({
      id: Date.now().toString(), type: 'port',
      target: host.trim(),
      status: openCount > 0 ? 'warning' : 'safe',
      summary: `${openCount} open ports found`,
      timestamp: Date.now(),
    });
    setLoading(false);
  };

  const scanSingle = async () => {
    if (!host.trim() || !port.trim()) return Alert.alert('Error', 'Enter host and port.');
    setLoading(true);
    const r = await scanPort(host.trim(), parseInt(port));
    setResults([r]);
    setLoading(false);
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="Port Scanner" subtitle="TCP port discovery" icon="🔍" accent={C.warning} />
      <View style={s.body}>
        <TextInput style={s.input} value={host} onChangeText={setHost}
          placeholder="Target host (IP or domain)" placeholderTextColor={C.textMuted}
          autoCapitalize="none" autoCorrect={false} />
        <View style={s.row}>
          <TextInput style={[s.input, { flex: 1 }]} value={port} onChangeText={setPort}
            placeholder="Port (single)" placeholderTextColor={C.textMuted} keyboardType="numeric" />
          <Btn label="SCAN" onPress={scanSingle} loading={loading} variant="ghost" />
        </View>
        <Btn label={`SCAN COMMON PORTS ${loading ? `(${progress}%)` : ''}`}
          onPress={scanAll} loading={loading} variant="cyan" fullWidth />

        {results.length > 0 && (
          <>
            <SectionTitle label={`Results — ${results.filter(r => r.open).length} open / ${results.length} scanned`} />
            {results.map((r) => (
              <GlassCard key={r.port} accent={r.open ? C.danger : C.bg2} padding={S.sm}>
                <View style={s.portRow}>
                  <View style={[s.portDot, { backgroundColor: r.open ? C.danger : C.textMuted }]} />
                  <Text style={[s.portNum, { color: r.open ? C.warning : C.textMuted }]}>{r.port}</Text>
                  <Text style={s.portService}>{r.service}</Text>
                  <Text style={[s.portState, { color: r.open ? C.danger : C.textMuted }]}>
                    {r.open ? 'OPEN' : 'CLOSED'}
                  </Text>
                  <Text style={s.portLatency}>{r.latencyMs}ms</Text>
                </View>
              </GlassCard>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── HTTP HEADER INSPECTOR ──────────────────────────────────────────────────
export const HTTPInspectorScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HTTPHeaderResult | null>(null);
  const addHistory = useStore((s) => s.addHistory);

  const inspect = async () => {
    if (!url.trim()) return Alert.alert('Error', 'Enter a URL.');
    setLoading(true);
    try {
      const r = await inspectHTTPHeaders(url.trim());
      setResult(r);
      const missing = r.securityHeaders.filter((h) => !h.present && h.risk === 'high').length;
      addHistory({
        id: Date.now().toString(), type: 'http',
        target: url.trim(),
        status: missing > 0 ? 'warning' : 'safe',
        summary: `${r.statusCode} — ${missing} missing critical headers`,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="HTTP Headers" subtitle="Inspect security headers" icon="📋" accent={C.pink} />
      <View style={s.body}>
        <View style={s.row}>
          <TextInput style={[s.input, { flex: 1 }]} value={url} onChangeText={setUrl}
            placeholder="https://example.com" placeholderTextColor={C.textMuted}
            autoCapitalize="none" autoCorrect={false} keyboardType="url" />
          <Btn label="GO" onPress={inspect} loading={loading} variant="pink" />
        </View>

        {result && (
          <>
            <GlassCard accent={result.statusCode < 400 ? C.success : C.danger}>
              <InfoRow label="Status" value={`${result.statusCode} ${result.statusText}`}
                valueColor={result.statusCode < 400 ? C.success : C.danger} />
              <InfoRow label="Server" value={result.server} />
              <InfoRow label="Content-Type" value={result.contentType} />
              <InfoRow label="Latency" value={`${result.latencyMs}ms`} />
            </GlassCard>

            <SectionTitle label="Security Headers" />
            {result.securityHeaders.map((h) => (
              <GlassCard key={h.name} accent={h.present ? C.success : h.risk === 'high' ? C.danger : C.warning} padding={S.sm}>
                <View style={s.headerRow}>
                  <Text style={s.headerIcon}>{h.present ? '✅' : h.risk === 'high' ? '❌' : '⚠️'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.headerName, { color: h.present ? C.success : h.risk === 'high' ? C.danger : C.warning }]}>{h.name}</Text>
                    <Text style={s.headerDesc}>{h.description}</Text>
                    {h.value && <Text style={s.headerValue} numberOfLines={1}>{h.value}</Text>}
                  </View>
                  <Tag label={h.risk.toUpperCase()} color={h.risk === 'high' ? C.danger : h.risk === 'medium' ? C.warning : C.success} />
                </View>
              </GlassCard>
            ))}

            <SectionTitle label="All Headers" />
            <GlassCard>
              {Object.entries(result.headers).map(([k, v]) => (
                <View key={k} style={s.rawHeaderRow}>
                  <Text style={s.rawHeaderKey}>{k}</Text>
                  <Text style={s.rawHeaderVal} numberOfLines={2} selectable>{v}</Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── SSL CHECKER ────────────────────────────────────────────────────────────
export const SSLCheckerScreen: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSLInfo | null>(null);
  const addHistory = useStore((s) => s.addHistory);

  const check = async () => {
    if (!domain.trim()) return Alert.alert('Error', 'Enter a domain.');
    setLoading(true);
    try {
      const r = await checkSSL(domain.trim());
      setResult(r);
      addHistory({
        id: Date.now().toString(), type: 'ssl',
        target: domain.trim(),
        status: r.valid ? (r.daysRemaining < 30 ? 'warning' : 'safe') : 'danger',
        summary: `Grade: ${r.grade} — ${r.daysRemaining > 0 ? `${r.daysRemaining} days left` : 'Unknown expiry'}`,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = !result ? C.textMuted :
    result.grade === 'A' ? C.success :
    result.grade === 'B' ? C.cyan :
    result.grade === 'C' ? C.warning : C.danger;

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="SSL Checker" subtitle="Certificate & security grade" icon="🔒" accent={C.cyan} />
      <View style={s.body}>
        <View style={s.row}>
          <TextInput style={[s.input, { flex: 1 }]} value={domain} onChangeText={setDomain}
            placeholder="example.com" placeholderTextColor={C.textMuted}
            autoCapitalize="none" autoCorrect={false} />
          <Btn label="CHECK" onPress={check} loading={loading} variant="cyan" />
        </View>
        {result && (
          <>
            <GlassCard accent={result.valid ? C.success : C.danger}>
              <View style={s.gradeRow}>
                <View>
                  <Text style={s.gradeLabel}>GRADE</Text>
                  <Text style={[s.gradeValue, { color: gradeColor }]}>{result.grade}</Text>
                </View>
                <Badge status={result.valid ? 'safe' : 'danger'} label={result.valid ? 'VALID' : 'INVALID'} />
              </View>
            </GlassCard>
            <GlassCard accent={C.cyan}>
              <InfoRow label="Domain"  value={result.domain} />
              <InfoRow label="Issuer"  value={result.issuer} />
              <InfoRow label="Valid From" value={result.validFrom} />
              <InfoRow label="Valid To"   value={result.validTo} />
              <InfoRow label="Days Left"
                value={result.daysRemaining > 0 ? `${result.daysRemaining} days` : 'Unknown'}
                valueColor={result.daysRemaining < 30 ? C.danger : result.daysRemaining < 90 ? C.warning : C.success}
              />
              <InfoRow label="Protocol" value={result.protocol} />
            </GlassCard>
            {result.error && (
              <GlassCard accent={C.warning}>
                <Text style={{ color: C.warning, fontFamily: 'monospace', fontSize: F.sm }}>⚠️ {result.error}</Text>
              </GlassCard>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── Shared styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  body: { padding: S.md, gap: S.sm, paddingBottom: 80 },
  input: {
    backgroundColor: C.bg1, borderWidth: 1, borderColor: C.border,
    borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 10,
    color: C.textPrimary, fontFamily: 'monospace', fontSize: F.md,
  },
  row: { flexDirection: 'row', gap: S.sm, alignItems: 'center' },
  pingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pingHost: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm },
  pingStatus: { fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700' },
  portRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  portDot: { width: 8, height: 8, borderRadius: 4 },
  portNum: { fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700', width: 45 },
  portService: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.sm, flex: 1 },
  portState: { fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700' },
  portLatency: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm },
  headerIcon: { fontSize: 16 },
  headerName: { fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700' },
  headerDesc: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, marginTop: 2 },
  headerValue: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs, marginTop: 2 },
  rawHeaderRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.border, gap: S.sm },
  rawHeaderKey: { color: C.pink, fontFamily: 'monospace', fontSize: F.xs, width: 120 },
  rawHeaderVal: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs, flex: 1 },
  gradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gradeLabel: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, letterSpacing: 2 },
  gradeValue: { fontFamily: 'monospace', fontSize: 52, fontWeight: '900' },
});
