// src/components/UI.tsx
// All reusable components in one file for simplicity

import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { C, F, R, S } from '../theme';

// ── GlassCard ──────────────────────────────────────────────────────────────
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: string;
  padding?: number;
  onPress?: () => void;
}> = ({ children, style, accent, padding = S.md, onPress }) => {
  const content = (
    <View style={[
      ui.glassCard,
      accent ? { borderColor: accent, borderLeftWidth: 3 } : null,
      { padding },
      style,
    ]}>
      {children}
    </View>
  );
  if (onPress) return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{content}</TouchableOpacity>
  );
  return content;
};

// ── Btn ────────────────────────────────────────────────────────────────────
type BtnVariant = 'violet' | 'cyan' | 'pink' | 'danger' | 'ghost';
export const Btn: React.FC<{
  label: string;
  onPress: () => void;
  variant?: BtnVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  icon?: string;
}> = ({ label, onPress, variant = 'violet', loading, disabled, style, fullWidth, icon }) => {
  const cfg: Record<BtnVariant, { bg: string; text: string; border: string }> = {
    violet: { bg: C.violet,  text: '#fff', border: C.violet },
    cyan:   { bg: C.cyan,    text: '#000', border: C.cyan },
    pink:   { bg: C.pink,    text: '#000', border: C.pink },
    danger: { bg: C.danger,  text: '#fff', border: C.danger },
    ghost:  { bg: 'transparent', text: C.violetBright, border: C.borderViolet },
  };
  const c = cfg[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        ui.btn,
        { backgroundColor: c.bg, borderColor: c.border },
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.4 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color={c.text} />
        : <Text style={[ui.btnLabel, { color: c.text }]}>{icon ? `${icon}  ` : ''}{label}</Text>
      }
    </TouchableOpacity>
  );
};

// ── Badge ──────────────────────────────────────────────────────────────────
type BadgeStatus = 'safe' | 'warning' | 'danger' | 'unknown' | 'info';
export const Badge: React.FC<{ status: BadgeStatus; label?: string }> = ({ status, label }) => {
  const cfg: Record<BadgeStatus, { color: string; bg: string }> = {
    safe:    { color: C.success, bg: C.success + '18' },
    warning: { color: C.warning, bg: C.warning + '18' },
    danger:  { color: C.danger,  bg: C.danger  + '18' },
    unknown: { color: C.textSecondary, bg: C.bg2 },
    info:    { color: C.cyan,    bg: C.cyan    + '18' },
  };
  const c = cfg[status];
  const labels: Record<BadgeStatus, string> = {
    safe: 'SAFE', warning: 'WARNING', danger: 'DANGER', unknown: 'UNKNOWN', info: 'INFO'
  };
  return (
    <View style={[ui.badge, { backgroundColor: c.bg, borderColor: c.color }]}>
      <Text style={[ui.badgeText, { color: c.color }]}>{label ?? labels[status]}</Text>
    </View>
  );
};

// ── SectionTitle ───────────────────────────────────────────────────────────
export const SectionTitle: React.FC<{ label: string; color?: string; style?: TextStyle }> = ({ label, color, style }) => (
  <Text style={[ui.sectionTitle, color ? { color } : null, style]}>{label}</Text>
);

// ── InfoRow ────────────────────────────────────────────────────────────────
export const InfoRow: React.FC<{ label: string; value: string; valueColor?: string; mono?: boolean }> = ({ label, value, valueColor, mono }) => (
  <View style={ui.infoRow}>
    <Text style={ui.infoLabel}>{label}</Text>
    <Text
      style={[ui.infoValue, valueColor ? { color: valueColor } : null, mono ? { fontFamily: 'monospace' } : null]}
      selectable
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

// ── ProgressBar ────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; max?: number; color?: string; height?: number }> = ({
  value, max = 100, color = C.violet, height = 6
}) => (
  <View style={[ui.progressBg, { height }]}>
    <View style={[ui.progressFill, { width: `${Math.min((value / max) * 100, 100)}%` as any, backgroundColor: color, height }]} />
  </View>
);

// ── PageHeader ─────────────────────────────────────────────────────────────
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: string;
  accent?: string;
}> = ({ title, subtitle, icon, accent = C.violet }) => (
  <View style={ui.pageHeader}>
    <View style={[ui.headerAccent, { backgroundColor: accent }]} />
    <View style={ui.headerContent}>
      {icon && <Text style={ui.headerIcon}>{icon}</Text>}
      <View>
        <Text style={[ui.headerTitle, { color: accent }]}>{title}</Text>
        {subtitle && <Text style={ui.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

// ── Divider ────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ color?: string }> = ({ color = C.border }) => (
  <View style={[ui.divider, { backgroundColor: color }]} />
);

// ── Tag ────────────────────────────────────────────────────────────────────
export const Tag: React.FC<{ label: string; color?: string }> = ({ label, color = C.violet }) => (
  <View style={[ui.tag, { borderColor: color + '66', backgroundColor: color + '18' }]}>
    <Text style={[ui.tagText, { color }]}>{label}</Text>
  </View>
);

// ── Styles ─────────────────────────────────────────────────────────────────
const ui = StyleSheet.create({
  glassCard: {
    backgroundColor: C.glass,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.glassBorder,
    marginBottom: S.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: S.lg,
    borderRadius: R.md,
    borderWidth: 1,
    minHeight: 46,
  },
  btnLabel: {
    fontSize: F.md,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: S.sm,
    borderRadius: R.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: F.xs,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: F.xs,
    color: C.textMuted,
    fontFamily: 'monospace',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: S.sm,
    marginTop: S.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: {
    color: C.textSecondary,
    fontSize: F.sm,
    fontFamily: 'monospace',
    flex: 1,
  },
  infoValue: {
    color: C.textPrimary,
    fontSize: F.sm,
    flex: 1.5,
    textAlign: 'right',
  },
  progressBg: {
    backgroundColor: C.bg2,
    borderRadius: R.full,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    borderRadius: R.full,
  },
  pageHeader: {
    paddingHorizontal: S.md,
    paddingTop: S.lg,
    paddingBottom: S.md,
  },
  headerAccent: {
    height: 2,
    width: 36,
    borderRadius: 2,
    marginBottom: S.sm,
    opacity: 0.8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: {
    fontSize: F.xxl,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: F.sm,
    color: C.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  divider: { height: 1, marginVertical: S.sm },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: S.sm,
    borderRadius: R.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: F.xs,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
