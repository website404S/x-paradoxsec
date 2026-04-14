// src/screens/MiscScreens.tsx
// DNS Checker, URL Scanner, Device Info, Command Library, Learning Hub

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { lookupDNS } from '../services/DNSService';
import { scanURL } from '../services/URLScannerService';
import { getRealDeviceInfo, formatBytes } from '../services/DeviceInfoService';
import { COMMAND_LIBRARY } from '../data/commandLibrary';
import { LEARNING_ARTICLES } from '../data/learningContent';
import { GlassCard, Btn, PageHeader, InfoRow, Badge, SectionTitle, ProgressBar, Tag } from '../components/UI';
import { C, F, R, S } from '../theme';
import { useStore } from '../store/useStore';

// ── DNS CHECKER ────────────────────────────────────────────────────────────
export const DNSCheckerScreen: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const addHistory = useStore((s) => s.addHistory);

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const r = await lookupDNS(domain.trim());
      setResult(r);
      addHistory({
        id: Date.now().toString(), type: 'dns', target: r.domain,
        status: r.error ? 'unknown' : 'safe',
        summary: `${r.records.length} records • ${r.latencyMs}ms`,
        timestamp: Date.now(),
      });
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const grouped: Record<string, any[]> = {};
  result?.records.forEach((r: any) => { grouped[r.type] = [...(grouped[r.type] ?? []), r]; });

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="DNS Lookup" subtitle="Query all DNS record types" icon="🌐" accent={C.violetBright} />
      <View style={s.body}>
        <View style={s.row}>
          <TextInput style={[s.input, { flex: 1 }]} value={domain} onChangeText={setDomain}
            placeholder="google.com" placeholderTextColor={C.textMuted}
            autoCapitalize="none" autoCorrect={false} returnKeyType="search"
            onSubmitEditing={lookup} />
          <Btn label="QUERY" onPress={lookup} loading={loading} variant="violet" />
        </View>
        {result && (
          <>
            <GlassCard accent={C.violetBright}>
              <InfoRow label="Domain"  value={result.domain} mono />
              <InfoRow label="IPs"     value={result.ip.join(', ') || 'None'} valueColor={C.cyan} mono />
              <InfoRow label="Records" value={`${result.records.length}`} />
              <InfoRow label="Latency" value={`${result.latencyMs}ms`} />
            </GlassCard>
            {Object.entries(grouped).map(([type, recs]) => (
              <GlassCard key={type}>
                <Text style={s.recType}>{type}</Text>
                {(recs as any[]).map((r, i) => (
                  <TouchableOpacity key={i} onPress={() => Clipboard.setStringAsync(r.value)}>
                    <Text style={s.recVal} selectable>{r.value}</Text>
                    <Text style={s.recTTL}>TTL {r.ttl}s</Text>
                  </TouchableOpacity>
                ))}
              </GlassCard>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── URL SCANNER ────────────────────────────────────────────────────────────
export const URLScannerScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const addHistory = useStore((s) => s.addHistory);

  const scan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const r = await scanURL(url.trim());
      setResult(r);
      addHistory({
        id: Date.now().toString(), type: 'url', target: url.trim(),
        status: r.threatLevel === 'dangerous' ? 'danger' : r.threatLevel === 'suspicious' ? 'warning' : 'safe',
        summary: `Score: ${r.score}/100`,
        timestamp: Date.now(),
      });
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const scoreColor = !result ? C.textMuted :
    result.score >= 70 ? C.danger :
    result.score >= 35 ? C.warning : C.success;

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="URL Scanner" subtitle="Phishing & malware detection" icon="🔗" accent={C.success} />
      <View style={s.body}>
        <TextInput style={s.input} value={url} onChangeText={setUrl}
          placeholder="https://example.com" placeholderTextColor={C.textMuted}
          autoCapitalize="none" autoCorrect={false} keyboardType="url" />
        <Btn label="SCAN URL" onPress={scan} loading={loading} variant="violet" fullWidth />
        {result && (
          <>
            <GlassCard accent={scoreColor}>
              <View style={s.scoreRow}>
                <View>
                  <Text style={s.scoreLabel}>DANGER SCORE</Text>
                  <Text style={[s.scoreNum, { color: scoreColor }]}>
                    {result.score}<Text style={s.scoreMax}>/100</Text>
                  </Text>
                </View>
                <Badge
                  status={result.threatLevel === 'dangerous' ? 'danger' : result.threatLevel === 'suspicious' ? 'warning' : 'safe'}
                  label={result.threatLevel.toUpperCase()}
                />
              </View>
              <ProgressBar value={result.score} color={scoreColor} height={6} />
            </GlassCard>
            <GlassCard>
              <SectionTitle label="Findings" />
              {result.reasons.map((r: string, i: number) => (
                <Text key={i} style={s.finding}>{r}</Text>
              ))}
            </GlassCard>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── DEVICE INFO ────────────────────────────────────────────────────────────
export const DeviceScanScreen: React.FC = () => {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getRealDeviceInfo();
    setInfo(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const batteryColor = !info ? C.textMuted :
    info.batteryLevel > 50 ? C.success :
    info.batteryLevel > 20 ? C.warning : C.danger;

  return (
    <ScrollView style={s.container}>
      <PageHeader title="Device Info" subtitle="Full real device data" icon="📱" accent={C.violetBright} />
      <View style={s.body}>
        <Btn label="REFRESH" onPress={load} loading={loading} variant="ghost" fullWidth />
        {info && (
          <>
            <SectionTitle label="Device" />
            <GlassCard accent={C.violet}>
              <InfoRow label="Name"         value={info.deviceName} />
              <InfoRow label="Brand"        value={info.brand} />
              <InfoRow label="Model"        value={info.model} />
              <InfoRow label="Manufacturer" value={info.manufacturer} />
              <InfoRow label="Device ID"    value={info.deviceId} mono />
            </GlassCard>

            <SectionTitle label="OS & Build" />
            <GlassCard accent={C.cyan}>
              <InfoRow label="OS"       value={`${info.systemName} ${info.systemVersion}`} valueColor={C.cyan} />
              <InfoRow label="API Level" value={String(info.apiLevel)} />
              <InfoRow label="Build ID"  value={info.buildId} mono />
              <InfoRow label="Emulator"  value={info.isEmulator ? 'Yes' : 'No'} valueColor={info.isEmulator ? C.warning : C.success} />
            </GlassCard>

            <SectionTitle label="Battery" />
            <GlassCard accent={batteryColor}>
              <View style={s.batRow}>
                <Text style={[s.batLevel, { color: batteryColor }]}>{info.batteryLevel}%</Text>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={info.batteryLevel} color={batteryColor} height={10} />
                  <InfoRow label="State" value={info.batteryState} />
                  <InfoRow label="Power Save" value={info.isPowerSaveMode ? 'ON' : 'OFF'} />
                </View>
              </View>
            </GlassCard>

            <SectionTitle label="Storage & Memory" />
            <GlassCard accent={C.pink}>
              <InfoRow label="Total RAM"  value={formatBytes(info.totalMemory)} />
              <InfoRow label="Used RAM"   value={formatBytes(info.usedMemory)} />
              <InfoRow label="Total Disk" value={formatBytes(info.totalStorage)} />
              <InfoRow label="Free Disk"  value={formatBytes(info.freeStorage)} />
            </GlassCard>

            <SectionTitle label="Network" />
            <GlassCard accent={C.cyan}>
              <InfoRow label="IP Address" value={info.ipAddress} valueColor={C.cyan} mono />
              <InfoRow label="MAC Address" value={info.macAddress} mono />
              <InfoRow label="Carrier" value={info.carrier} />
            </GlassCard>

            <SectionTitle label="Security" />
            <GlassCard accent={C.success}>
              <InfoRow label="PIN/Fingerprint Set" value={info.pinOrFingerprintSet ? 'Yes ✓' : 'No ✗'} valueColor={info.pinOrFingerprintSet ? C.success : C.danger} />
              <InfoRow label="Bundle ID" value={info.bundleId} mono />
              <InfoRow label="App Version" value={info.appVersion} />
              <InfoRow label="Installer" value={info.installerPackageName} />
            </GlassCard>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── COMMAND LIBRARY ────────────────────────────────────────────────────────
export const CommandLibScreen: React.FC = () => {
  const [activeCat, setActiveCat] = useState(COMMAND_LIBRARY[0].id);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const cat = COMMAND_LIBRARY.find((c) => c.id === activeCat)!;
  const filtered = search
    ? COMMAND_LIBRARY.flatMap(c => c.commands.filter(cmd =>
        cmd.cmd.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase())))
    : cat.commands;

  return (
    <View style={s.container}>
      <PageHeader title="Commands" subtitle="Security command reference" icon="📖" accent={C.violet} />
      <TextInput style={[s.input, { marginHorizontal: S.md, marginBottom: S.sm }]}
        value={search} onChangeText={setSearch}
        placeholder="Search commands..." placeholderTextColor={C.textMuted}
        autoCapitalize="none" autoCorrect={false} />
      {!search && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: S.sm }}>
          <View style={s.tabRow}>
            {COMMAND_LIBRARY.map((c) => (
              <TouchableOpacity key={c.id} style={[s.tab, activeCat === c.id && { borderColor: c.color + '88', backgroundColor: c.color + '18' }]}
                onPress={() => setActiveCat(c.id)}>
                <Text style={{ fontSize: 12 }}>{c.icon}</Text>
                <Text style={[s.tabText, activeCat === c.id && { color: c.color }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: S.md, paddingBottom: 80 }}>
        {filtered.map((cmd) => {
          const key = cmd.cmd + cmd.category;
          const isExp = expanded === key;
          return (
            <TouchableOpacity key={key} onPress={() => setExpanded(isExp ? null : key)}>
              <GlassCard accent={isExp ? C.violet : undefined} padding={S.sm}>
                <View style={s.cmdRow}>
                  <Text style={s.cmdText}>{cmd.cmd}</Text>
                  <TouchableOpacity onPress={() => Clipboard.setStringAsync(cmd.example)}>
                    <Text style={s.copyBtn}>COPY</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.cmdDesc}>{cmd.description}</Text>
                {isExp && (
                  <View style={s.exampleBox}>
                    <Text style={s.exampleText} selectable>{cmd.example}</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ── LEARNING HUB ───────────────────────────────────────────────────────────
export const LearningHubScreen: React.FC = () => {
  const [selected, setSelected] = useState<any>(null);

  if (selected) return (
    <ScrollView style={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => setSelected(null)}>
        <Text style={s.backText}>← BACK</Text>
      </TouchableOpacity>
      <View style={s.body}>
        <Text style={s.articleIcon}>{selected.icon}</Text>
        <Text style={s.articleTitle}>{selected.title}</Text>
        <View style={s.articleMeta}>
          <Tag label={selected.category} color={C.violet} />
          <Tag label={selected.readTime} color={C.cyan} />
          <Tag label={selected.difficulty}
            color={selected.difficulty === 'Beginner' ? C.success : selected.difficulty === 'Intermediate' ? C.warning : C.danger} />
        </View>
        {selected.content.map((section: any, i: number) => (
          <GlassCard key={i} accent={C.violet}>
            <Text style={s.sectionHeading}>{section.heading}</Text>
            <Text style={s.sectionBody}>{section.body}</Text>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={s.container}>
      <PageHeader title="Learning Hub" subtitle="Security education" icon="📚" accent={C.pink} />
      <View style={s.body}>
        {LEARNING_ARTICLES.map((a) => (
          <GlassCard key={a.id} onPress={() => setSelected(a)} accent={C.pink}>
            <View style={s.articleCardRow}>
              <Text style={{ fontSize: 28 }}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.articleCardTitle}>{a.title}</Text>
                <View style={s.articleMeta}>
                  <Text style={s.metaText}>{a.category}</Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.metaText}>{a.readTime}</Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={[s.metaText, {
                    color: a.difficulty === 'Beginner' ? C.success : a.difficulty === 'Intermediate' ? C.warning : C.danger
                  }]}>{a.difficulty}</Text>
                </View>
              </View>
              <Text style={s.arrowText}>›</Text>
            </View>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  body: { padding: S.md, paddingBottom: 80, gap: S.sm },
  row: { flexDirection: 'row', gap: S.sm, alignItems: 'center' },
  input: {
    backgroundColor: C.bg1, borderWidth: 1, borderColor: C.border,
    borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 10,
    color: C.textPrimary, fontFamily: 'monospace', fontSize: F.md,
  },
  recType: { color: C.violetBright, fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700', marginBottom: S.xs },
  recVal: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm, marginBottom: 2 },
  recTTL: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, marginBottom: S.xs },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm },
  scoreLabel: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, letterSpacing: 2 },
  scoreNum: { fontFamily: 'monospace', fontSize: 48, fontWeight: '900' },
  scoreMax: { fontSize: F.md, color: C.textMuted },
  finding: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm, marginBottom: 4 },
  batRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  batLevel: { fontFamily: 'monospace', fontSize: F.hero, fontWeight: '900' },
  tabRow: { flexDirection: 'row', gap: S.xs, paddingHorizontal: S.md },
  tab: { flexDirection: 'row', gap: 4, paddingHorizontal: S.sm, paddingVertical: 6, borderRadius: R.md, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  tabText: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700' },
  cmdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cmdText: { color: C.success, fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700', flex: 1 },
  cmdDesc: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs },
  copyBtn: { color: C.violetBright, fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700', borderWidth: 1, borderColor: C.borderViolet, borderRadius: R.sm, paddingHorizontal: S.xs, paddingVertical: 2 },
  exampleBox: { backgroundColor: C.bg2, borderRadius: R.sm, padding: S.sm, marginTop: S.sm },
  exampleText: { color: C.cyan, fontFamily: 'monospace', fontSize: F.xs },
  backBtn: { padding: S.md },
  backText: { color: C.violet, fontFamily: 'monospace', fontSize: F.sm },
  articleIcon: { fontSize: 40, textAlign: 'center', marginBottom: S.sm },
  articleTitle: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.xl, fontWeight: '900', textAlign: 'center', marginBottom: S.sm },
  articleMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs, justifyContent: 'center', marginBottom: S.md },
  sectionHeading: { color: C.violetBright, fontFamily: 'monospace', fontSize: F.md, fontWeight: '700', marginBottom: S.sm },
  sectionBody: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.sm, lineHeight: 22 },
  articleCardRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  articleCardTitle: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.md, fontWeight: '700' },
  metaText: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs },
  metaDot: { color: C.textMuted },
  arrowText: { color: C.textMuted, fontSize: 22 },
});
