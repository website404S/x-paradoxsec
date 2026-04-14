// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C, F, R, S } from '../theme';
import { GlassCard } from '../components/UI';
import { useStore } from '../store/useStore';

const TOOLS = [
  { id: 'IPTracker',     label: 'IP Tracker',      icon: '📡', color: C.cyan,   desc: 'Geolocate any IP' },
  { id: 'DNSChecker',    label: 'DNS Lookup',       icon: '🌐', color: C.violetBright, desc: 'Query DNS records' },
  { id: 'URLScanner',    label: 'URL Scanner',      icon: '🔗', color: C.success, desc: 'Phishing detector' },
  { id: 'PortScanner',   label: 'Port Scanner',     icon: '🔍', color: C.warning, desc: 'Scan open ports' },
  { id: 'SSLChecker',    label: 'SSL Checker',      icon: '🔒', color: C.cyan,   desc: 'Cert & grade check' },
  { id: 'HTTPInspector', label: 'HTTP Headers',     icon: '📋', color: C.pink,   desc: 'Inspect headers' },
  { id: 'HashTools',     label: 'Hash Tools',       icon: '🔐', color: C.violetBright, desc: 'MD5, SHA, HMAC' },
  { id: 'EncoderTools',  label: 'Encoder',          icon: '⚙️', color: C.warning, desc: 'Base64, Hex, URL' },
  { id: 'AESTools',      label: 'AES Crypto',       icon: '🛡️', color: C.violet,  desc: 'Encrypt / Decrypt' },
  { id: 'JWTDecoder',    label: 'JWT Decoder',      icon: '🪙', color: C.cyan,   desc: 'Decode JWT tokens' },
  { id: 'PasswordCheck', label: 'Password Check',   icon: '🔑', color: C.success, desc: 'Strength analyzer' },
  { id: 'NetworkInfo',   label: 'Network Info',     icon: '📶', color: C.pink,   desc: 'WiFi & network data' },
  { id: 'DeviceScan',    label: 'Device Info',      icon: '📱', color: C.violetBright, desc: 'Full device data' },
  { id: 'Terminal',      label: 'Terminal',         icon: '⌨️', color: C.success, desc: 'Web-based shell' },
  { id: 'CodeEditor',    label: 'Code Editor',      icon: '✏️', color: C.cyan,   desc: 'Monaco editor' },
  { id: 'CommandLib',    label: 'Commands',         icon: '📖', color: C.violet,  desc: 'Security reference' },
  { id: 'LearningHub',   label: 'Learning',         icon: '📚', color: C.pink,   desc: 'Security guides' },
];

export const HomeScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const history = useStore((s) => s.history);

  const threats = history.filter((h) => h.status === 'danger').length;
  const warnings = history.filter((h) => h.status === 'warning').length;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* ── Hero ── */}
      <View style={s.hero}>
        <View style={s.heroAccent} />
        <Text style={s.heroTitle}>X-ParadoxSec</Text>
        <Text style={s.heroSub}>Advanced Security Toolkit</Text>
        <View style={s.statsRow}>
          <Stat label="Scans" value={history.length} color={C.violetBright} />
          <Stat label="Threats" value={threats} color={C.danger} />
          <Stat label="Warnings" value={warnings} color={C.warning} />
        </View>
      </View>

      {/* ── Tool Grid ── */}
      <Text style={s.sectionLabel}>TOOLS</Text>
      <View style={s.grid}>
        {TOOLS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[s.toolCard, { borderColor: t.color + '30' }]}
            onPress={() => nav.navigate(t.id)}
            activeOpacity={0.7}
          >
            <View style={[s.toolIconBg, { backgroundColor: t.color + '18' }]}>
              <Text style={s.toolIcon}>{t.icon}</Text>
            </View>
            <Text style={[s.toolLabel, { color: t.color }]} numberOfLines={1}>{t.label}</Text>
            <Text style={s.toolDesc} numberOfLines={1}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recent ── */}
      {history.length > 0 && (
        <>
          <Text style={s.sectionLabel}>RECENT SCANS</Text>
          {history.slice(0, 5).map((h) => (
            <GlassCard key={h.id} accent={h.status === 'danger' ? C.danger : h.status === 'warning' ? C.warning : C.success} padding={S.sm}>
              <View style={s.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.histTarget} numberOfLines={1}>{h.target}</Text>
                  <Text style={s.histTime}>{new Date(h.timestamp).toLocaleString()}</Text>
                </View>
                <Text style={[s.histStatus, {
                  color: h.status === 'danger' ? C.danger : h.status === 'warning' ? C.warning : C.success
                }]}>{h.status.toUpperCase()}</Text>
              </View>
            </GlassCard>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <View style={s.statBox}>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  content: { padding: S.md, paddingBottom: 100 },

  hero: { marginBottom: S.lg },
  heroAccent: { width: 48, height: 3, backgroundColor: C.violet, borderRadius: 2, marginBottom: S.sm },
  heroTitle: { fontSize: F.hero, fontFamily: 'monospace', fontWeight: '900', color: C.textPrimary, letterSpacing: 2 },
  heroSub: { fontSize: F.sm, color: C.textSecondary, fontFamily: 'monospace', marginBottom: S.md },
  statsRow: { flexDirection: 'row', gap: S.sm },
  statBox: {
    flex: 1, backgroundColor: C.bg1, borderRadius: R.md, padding: S.sm,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  statVal: { fontSize: F.xxl, fontFamily: 'monospace', fontWeight: '900' },
  statLabel: { fontSize: F.xs, color: C.textMuted, fontFamily: 'monospace' },

  sectionLabel: {
    fontSize: F.xs, color: C.textMuted, fontFamily: 'monospace',
    letterSpacing: 3, marginBottom: S.sm, marginTop: S.md,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg },
  toolCard: {
    width: '30%', flexGrow: 1, minWidth: 95,
    backgroundColor: C.bg1, borderRadius: R.lg, borderWidth: 1,
    padding: S.sm, alignItems: 'center', gap: S.xs,
  },
  toolIconBg: { width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  toolIcon: { fontSize: 20 },
  toolLabel: { fontSize: F.xs, fontFamily: 'monospace', fontWeight: '700', textAlign: 'center' },
  toolDesc: { fontSize: 9, color: C.textMuted, fontFamily: 'monospace', textAlign: 'center' },

  histRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  histTarget: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm },
  histTime: { color: C.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 2 },
  histStatus: { fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700' },
});
