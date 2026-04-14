// src/screens/IPTrackerScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { trackIP, getMyIP, IPInfo } from '../services/IPTrackerService';
import { GlassCard, Btn, PageHeader, InfoRow, Badge, SectionTitle, Tag } from '../components/UI';
import { C, F, S } from '../theme';
import { useStore } from '../store/useStore';

export const IPTrackerScreen: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [myIP, setMyIP] = useState<IPInfo | null>(null);
  const [result, setResult] = useState<IPInfo | null>(null);
  const addHistory = useStore((s) => s.addHistory);

  useEffect(() => {
    getMyIP().then(setMyIP).catch(() => {});
  }, []);

  const handleTrack = async (target?: string) => {
    const q = target ?? input.trim();
    if (!q) return Alert.alert('Error', 'Enter an IP or domain.');
    setLoading(true);
    try {
      const res = await trackIP(q);
      setResult(res);
      addHistory({
        id: Date.now().toString(),
        type: 'ip',
        target: res.query,
        status: res.proxy || res.hosting ? 'warning' : 'safe',
        summary: `${res.city}, ${res.country} — ${res.isp}`,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderIPCard = (info: IPInfo, title: string, accent: string) => (
    <GlassCard accent={accent}>
      <Text style={[s.cardTitle, { color: accent }]}>{title}</Text>
      <InfoRow label="IP Address"  value={info.query} valueColor={accent} mono />
      <InfoRow label="Country"     value={`${info.countryCode} — ${info.country}`} />
      <InfoRow label="Region"      value={`${info.regionName} (${info.region})`} />
      <InfoRow label="City"        value={info.city} />
      <InfoRow label="ZIP Code"    value={info.zip || 'N/A'} />
      <InfoRow label="Timezone"    value={info.timezone} />
      <InfoRow label="Coordinates" value={`${info.lat}, ${info.lon}`} mono />
      <InfoRow label="ISP"         value={info.isp} />
      <InfoRow label="Org"         value={info.org} />
      <InfoRow label="AS"          value={info.as} />
      <View style={s.tagRow}>
        {info.proxy   && <Tag label="PROXY"   color={C.warning} />}
        {info.hosting && <Tag label="HOSTING" color={C.cyan} />}
        {info.mobile  && <Tag label="MOBILE"  color={C.violetBright} />}
        {!info.proxy && !info.hosting && <Tag label="RESIDENTIAL" color={C.success} />}
      </View>
    </GlassCard>
  );

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="IP Tracker" subtitle="Real-time IP geolocation" icon="📡" accent={C.cyan} />

      {/* My IP */}
      {myIP && (
        <>
          <SectionTitle label="Your Public IP" />
          <GlassCard accent={C.violet} padding={S.sm}>
            <View style={s.myIPRow}>
              <View>
                <Text style={s.myIPAddr}>{myIP.query}</Text>
                <Text style={s.myIPLocation}>{myIP.city}, {myIP.country}</Text>
              </View>
              <Btn label="Track" onPress={() => { setInput(myIP.query); handleTrack(myIP.query); }} variant="ghost" style={s.trackBtn} />
            </View>
          </GlassCard>
        </>
      )}

      {/* Input */}
      <SectionTitle label="Track Any IP or Domain" />
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="8.8.8.8 or google.com"
          placeholderTextColor={C.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => handleTrack()}
        />
        <Btn label="TRACK" onPress={() => handleTrack()} loading={loading} variant="cyan" />
      </View>

      {/* Result */}
      {result && (
        <>
          <SectionTitle label="Result" />
          {result.status === 'fail'
            ? <GlassCard accent={C.danger}><Text style={s.errText}>❌ {result.message}</Text></GlassCard>
            : renderIPCard(result, `📍 ${result.query}`, C.cyan)
          }
        </>
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  cardTitle: { fontFamily: 'monospace', fontSize: F.md, fontWeight: '700', marginBottom: S.sm },
  myIPRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myIPAddr: { color: C.violetBright, fontFamily: 'monospace', fontSize: F.xl, fontWeight: '900' },
  myIPLocation: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.sm, marginTop: 2 },
  trackBtn: { paddingHorizontal: S.sm, paddingVertical: 6 },
  inputRow: { flexDirection: 'row', gap: S.sm, paddingHorizontal: S.md, marginBottom: S.md },
  input: {
    flex: 1, backgroundColor: C.bg1, borderWidth: 1, borderColor: C.borderCyan,
    borderRadius: 8, paddingHorizontal: S.md, color: C.textPrimary,
    fontFamily: 'monospace', fontSize: F.md,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs, marginTop: S.sm },
  errText: { color: C.danger, fontFamily: 'monospace', fontSize: F.sm },
});
