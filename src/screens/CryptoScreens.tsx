// src/screens/CryptoScreens.tsx
// Hash Tools, Encoder, AES Crypto, JWT Decoder, Password Checker

import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  hashAll, HashResults,
  encodeBase64, decodeBase64, encodeHex, decodeHex,
  encodeURL, decodeURL, encodeHTML, decodeHTML,
  toBinary, fromBinary, toROT13,
  aesEncrypt, aesDecrypt,
  analyzePassword, PasswordAnalysis,
  decodeJWT, JWTDecoded,
} from '../services/CryptoService';
import { GlassCard, Btn, PageHeader, SectionTitle, ProgressBar, InfoRow } from '../components/UI';
import { C, F, R, S } from '../theme';

// ── Shared input style ─────────────────────────────────────────────────────
const inputStyle = (borderColor = C.borderViolet) => ({
  backgroundColor: C.bg1, borderWidth: 1, borderColor,
  borderRadius: R.md, padding: S.md, color: C.textPrimary,
  fontFamily: 'monospace' as const, fontSize: F.sm,
  textAlignVertical: 'top' as const, minHeight: 60,
});

const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  Alert.alert('Copied!', 'Value copied to clipboard.');
};

// ── HASH TOOLS ─────────────────────────────────────────────────────────────
export const HashToolsScreen: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<HashResults | null>(null);

  const compute = () => {
    if (!input) return;
    setResults(hashAll(input));
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="Hash Tools" subtitle="MD5, SHA-1/256/512, RIPEMD160" icon="🔐" accent={C.violetBright} />
      <View style={s.body}>
        <TextInput style={inputStyle()} value={input} onChangeText={setInput}
          placeholder="Enter text to hash..." placeholderTextColor={C.textMuted} multiline />
        <Btn label="COMPUTE ALL HASHES" onPress={compute} variant="violet" fullWidth />
        {results && (
          <GlassCard accent={C.violet}>
            {Object.entries(results).map(([algo, hash]) => (
              <TouchableOpacity key={algo} style={s.hashRow} onPress={() => copyToClipboard(hash)}>
                <Text style={s.algoLabel}>{algo.toUpperCase()}</Text>
                <Text style={s.hashValue} selectable numberOfLines={1}>{hash}</Text>
                <Text style={s.copyHint}>TAP</Text>
              </TouchableOpacity>
            ))}
          </GlassCard>
        )}
      </View>
    </ScrollView>
  );
};

// ── ENCODER TOOLS ──────────────────────────────────────────────────────────
type EncodeMode = 'base64' | 'hex' | 'url' | 'html' | 'binary' | 'rot13';

export const EncoderToolsScreen: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<EncodeMode>('base64');
  const [output, setOutput] = useState('');
  const [isEncode, setIsEncode] = useState(true);

  const MODES: { id: EncodeMode; label: string }[] = [
    { id: 'base64', label: 'Base64' },
    { id: 'hex',    label: 'Hex' },
    { id: 'url',    label: 'URL' },
    { id: 'html',   label: 'HTML' },
    { id: 'binary', label: 'Binary' },
    { id: 'rot13',  label: 'ROT13' },
  ];

  const run = () => {
    if (!input) return;
    const fns: Record<EncodeMode, { enc: (s: string) => string; dec: (s: string) => string }> = {
      base64: { enc: encodeBase64, dec: decodeBase64 },
      hex:    { enc: encodeHex,    dec: decodeHex },
      url:    { enc: encodeURL,    dec: decodeURL },
      html:   { enc: encodeHTML,   dec: decodeHTML },
      binary: { enc: toBinary,     dec: fromBinary },
      rot13:  { enc: toROT13,      dec: toROT13 },
    };
    setOutput(isEncode ? fns[mode].enc(input) : fns[mode].dec(input));
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="Encoder" subtitle="Encode / Decode in multiple formats" icon="⚙️" accent={C.warning} />
      <View style={s.body}>
        {/* Mode selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
          <View style={s.modeRow}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[s.modeBtn, mode === m.id && s.modeBtnActive]}
                onPress={() => setMode(m.id)}
              >
                <Text style={[s.modeBtnText, mode === m.id && { color: C.warning }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Encode / Decode toggle */}
        <View style={s.toggleRow}>
          <TouchableOpacity style={[s.toggleBtn, isEncode && s.toggleActive]} onPress={() => setIsEncode(true)}>
            <Text style={[s.toggleText, isEncode && { color: C.warning }]}>ENCODE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, !isEncode && s.toggleActive]} onPress={() => setIsEncode(false)}>
            <Text style={[s.toggleText, !isEncode && { color: C.warning }]}>DECODE</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={[inputStyle(C.borderViolet), { marginBottom: S.sm }]} value={input}
          onChangeText={setInput} placeholder="Input..." placeholderTextColor={C.textMuted} multiline />
        <Btn label="RUN" onPress={run} variant="ghost" fullWidth />
        {output !== '' && (
          <GlassCard accent={C.warning} style={{ marginTop: S.sm }}>
            <Text style={s.outputLabel}>OUTPUT</Text>
            <Text style={s.outputText} selectable>{output}</Text>
            <Btn label="COPY" onPress={() => copyToClipboard(output)} variant="ghost" style={{ marginTop: S.sm }} />
          </GlassCard>
        )}
      </View>
    </ScrollView>
  );
};

// ── AES CRYPTO ─────────────────────────────────────────────────────────────
export const AESToolsScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const run = () => {
    if (!text || !key) return Alert.alert('Error', 'Enter both text and key.');
    setOutput(mode === 'encrypt' ? aesEncrypt(text, key) : aesDecrypt(text, key));
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="AES Crypto" subtitle="AES-256 Encrypt / Decrypt" icon="🛡️" accent={C.violet} />
      <View style={s.body}>
        <View style={s.toggleRow}>
          {(['encrypt', 'decrypt'] as const).map((m) => (
            <TouchableOpacity key={m} style={[s.toggleBtn, mode === m && s.toggleActive]} onPress={() => setMode(m)}>
              <Text style={[s.toggleText, mode === m && { color: C.violetBright }]}>{m.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SectionTitle label="Text / Ciphertext" />
        <TextInput style={[inputStyle(), { marginBottom: S.sm }]} value={text}
          onChangeText={setText} placeholder="Enter text..." placeholderTextColor={C.textMuted} multiline />
        <SectionTitle label="Secret Key" />
        <TextInput style={[inputStyle(), { marginBottom: S.sm }]} value={key}
          onChangeText={setKey} placeholder="Enter secret key..." placeholderTextColor={C.textMuted}
          secureTextEntry />
        <Btn label={mode === 'encrypt' ? '🔒 ENCRYPT' : '🔓 DECRYPT'} onPress={run} variant="violet" fullWidth />
        {output !== '' && (
          <GlassCard accent={C.violet} style={{ marginTop: S.sm }}>
            <Text style={s.outputLabel}>RESULT</Text>
            <Text style={s.outputText} selectable>{output}</Text>
            <Btn label="COPY" onPress={() => copyToClipboard(output)} variant="ghost" style={{ marginTop: S.sm }} />
          </GlassCard>
        )}
      </View>
    </ScrollView>
  );
};

// ── JWT DECODER ────────────────────────────────────────────────────────────
export const JWTDecoderScreen: React.FC = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<JWTDecoded | null>(null);

  const decode = () => {
    if (!token) return;
    const r = decodeJWT(token.trim());
    if (!r) return Alert.alert('Error', 'Invalid JWT token format.');
    setResult(r);
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="JWT Decoder" subtitle="Decode & inspect JWT tokens" icon="🪙" accent={C.cyan} />
      <View style={s.body}>
        <TextInput style={[inputStyle(C.borderCyan), { marginBottom: S.sm }]} value={token}
          onChangeText={setToken} placeholder="Paste JWT token here..." placeholderTextColor={C.textMuted}
          multiline autoCapitalize="none" autoCorrect={false} />
        <Btn label="DECODE" onPress={decode} variant="cyan" fullWidth />
        {result && (
          <>
            <GlassCard accent={result.isExpired ? C.danger : C.success} style={{ marginTop: S.sm }}>
              <InfoRow label="Status" value={result.isExpired ? '⚠️ EXPIRED' : '✅ VALID'}
                valueColor={result.isExpired ? C.danger : C.success} />
              {result.expiresAt && <InfoRow label="Expires" value={result.expiresAt} />}
            </GlassCard>
            <SectionTitle label="Header" />
            <GlassCard accent={C.cyan}>
              <Text style={s.jsonText}>{JSON.stringify(result.header, null, 2)}</Text>
            </GlassCard>
            <SectionTitle label="Payload" />
            <GlassCard accent={C.violetBright}>
              <Text style={s.jsonText} selectable>{JSON.stringify(result.payload, null, 2)}</Text>
            </GlassCard>
            <SectionTitle label="Signature (raw)" />
            <GlassCard>
              <Text style={s.sigText} selectable numberOfLines={3}>{result.signature}</Text>
            </GlassCard>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── PASSWORD ANALYZER ──────────────────────────────────────────────────────
export const PasswordCheckScreen: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const analysis = pwd ? analyzePassword(pwd) : null;

  const strengthColor = !analysis ? C.textMuted :
    analysis.score >= 80 ? C.success :
    analysis.score >= 60 ? C.cyan :
    analysis.score >= 40 ? C.warning : C.danger;

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="Password Analyzer" subtitle="Strength & crack time estimator" icon="🔑" accent={C.success} />
      <View style={s.body}>
        <View style={s.pwdRow}>
          <TextInput
            style={[inputStyle(), { flex: 1, minHeight: 46 }]}
            value={pwd} onChangeText={setPwd}
            placeholder="Enter password to analyze..."
            placeholderTextColor={C.textMuted}
            secureTextEntry={!show}
            autoCapitalize="none" autoCorrect={false}
          />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShow(!show)}>
            <Text style={{ fontSize: 20 }}>{show ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {analysis && (
          <>
            <GlassCard accent={strengthColor} style={{ marginTop: S.sm }}>
              <View style={s.scoreRow}>
                <View>
                  <Text style={s.strengthLabel}>STRENGTH</Text>
                  <Text style={[s.strengthValue, { color: strengthColor }]}>{analysis.strength}</Text>
                </View>
                <Text style={[s.scoreNum, { color: strengthColor }]}>{analysis.score}<Text style={s.scoreMax}>/100</Text></Text>
              </View>
              <ProgressBar value={analysis.score} color={strengthColor} height={8} />
            </GlassCard>

            <GlassCard accent={C.violet}>
              <InfoRow label="Crack Time (GPU)" value={analysis.crackTime} valueColor={strengthColor} />
              <InfoRow label="Entropy (bits)" value={analysis.entropy.toFixed(1)} mono />
              <InfoRow label="Charset Size" value={String(analysis.charsetSize)} />
              <InfoRow label="Length" value={`${pwd.length} chars`} />
            </GlassCard>

            {analysis.issues.length > 0 && (
              <GlassCard accent={C.danger}>
                <Text style={s.issueTitle}>ISSUES</Text>
                {analysis.issues.map((i, idx) => (
                  <Text key={idx} style={s.issueText}>❌ {i}</Text>
                ))}
              </GlassCard>
            )}
            {analysis.suggestions.length > 0 && (
              <GlassCard accent={C.cyan}>
                <Text style={s.issueTitle}>SUGGESTIONS</Text>
                {analysis.suggestions.map((s2, idx) => (
                  <Text key={idx} style={s.suggText}>💡 {s2}</Text>
                ))}
              </GlassCard>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  body: { padding: S.md, gap: S.sm, paddingBottom: 80 },

  hashRow: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  algoLabel: { color: C.violetBright, fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700', width: 70 },
  hashValue: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs, flex: 1 },
  copyHint: { color: C.textMuted, fontFamily: 'monospace', fontSize: 9 },

  modeRow: { flexDirection: 'row', gap: S.xs },
  modeBtn: {
    paddingHorizontal: S.sm, paddingVertical: 6,
    borderRadius: R.sm, borderWidth: 1, borderColor: C.border,
  },
  modeBtnActive: { borderColor: C.warning + '66', backgroundColor: C.warning + '18' },
  modeBtnText: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700' },

  toggleRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.sm },
  toggleBtn: {
    flex: 1, paddingVertical: 8, borderRadius: R.sm,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  toggleActive: { borderColor: C.violetBright + '66', backgroundColor: C.violet + '18' },
  toggleText: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700' },

  outputLabel: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, letterSpacing: 2, marginBottom: S.sm },
  outputText: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm, lineHeight: 20 },
  jsonText: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm, lineHeight: 20 },
  sigText: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs },

  pwdRow: { flexDirection: 'row', gap: S.sm, alignItems: 'center' },
  eyeBtn: { padding: S.sm },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm },
  strengthLabel: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, letterSpacing: 2 },
  strengthValue: { fontFamily: 'monospace', fontSize: F.xl, fontWeight: '900' },
  scoreNum: { fontFamily: 'monospace', fontSize: 40, fontWeight: '900' },
  scoreMax: { fontSize: F.md, color: C.textMuted },

  issueTitle: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.xs, letterSpacing: 2, marginBottom: S.xs },
  issueText: { color: C.danger, fontFamily: 'monospace', fontSize: F.sm, marginBottom: 2 },
  suggText: { color: C.cyan, fontFamily: 'monospace', fontSize: F.sm, marginBottom: 2 },
});
