import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { isLiquidGlassSupported } from '@callstack/liquid-glass';
import { GlassBackground } from '../../../core/ui/GlassBackground';

/**
 * Only on iOS 26+ (real Liquid Glass) does the header render as a glass
 * surface floating over content — `@callstack/liquid-glass` has no Android
 * implementation, and faking the same translucent-floating look there (and
 * on older iOS) would just be a flat tint with no real blur, so every other
 * platform/version keeps the normal opaque native header instead.
 */
export const isGlassHeaderActive = Platform.OS === 'ios' && isLiquidGlassSupported;

/**
 * Shared by every native-stack navigator. Screens with a visible header
 * must add their own top inset only when this is active
 * (see `useOptionalHeaderHeight`/`useGlassScrollInsets`) — otherwise the
 * navigator already reserves space for the (non-transparent) header.
 */
export const glassHeaderScreenOptions: NativeStackNavigationOptions = isGlassHeaderActive
  ? {
      headerTransparent: true,
      headerBackground: () => <GlassBackground style={StyleSheet.absoluteFill} />,
    }
  : {};
