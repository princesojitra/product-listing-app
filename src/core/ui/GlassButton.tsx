import React from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { isLiquidGlassSupported, LiquidGlassView } from '@callstack/liquid-glass';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  /** `destructive` tints the glass red, for actions like logging out. */
  variant?: 'default' | 'destructive';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const DESTRUCTIVE_TINT = 'rgba(220, 38, 38, 0.18)';
const DESTRUCTIVE_TEXT = '#dc2626';
const DEFAULT_TEXT = '#111827';

/**
 * A secondary/contextual action button: real Liquid Glass on supported
 * iOS, a translucent fallback elsewhere. Not for primary CTAs — a filled,
 * fully opaque button keeps better legibility for the one action per
 * screen that matters most (see `LoginScreen`'s submit button).
 */
export function GlassButton({
  label,
  onPress,
  variant = 'default',
  style,
  accessibilityLabel,
}: GlassButtonProps) {
  const textColor = variant === 'destructive' ? DESTRUCTIVE_TEXT : DEFAULT_TEXT;
  const content = <Text style={[styles.label, { color: textColor }]}>{label}</Text>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}>
      {Platform.OS === 'ios' && isLiquidGlassSupported ? (
        <LiquidGlassView
          interactive
          effect="regular"
          tintColor={variant === 'destructive' ? DESTRUCTIVE_TINT : undefined}
          style={[styles.button, style]}>
          {content}
        </LiquidGlassView>
      ) : (
        <View style={[styles.button, styles.fallback, style]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
