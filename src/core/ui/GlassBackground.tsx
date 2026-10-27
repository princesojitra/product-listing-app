import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { isLiquidGlassSupported, LiquidGlassView } from '@callstack/liquid-glass';

interface GlassBackgroundProps {
  style?: StyleProp<ViewStyle>;
}

/** Real Liquid Glass on supported iOS versions; a translucent surface everywhere else. */
export function GlassBackground({ style }: GlassBackgroundProps) {
  if (Platform.OS === 'ios' && isLiquidGlassSupported) {
    return <LiquidGlassView style={style} effect="regular" colorScheme="light" />;
  }
  return <View style={[style, styles.fallback]} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
});
