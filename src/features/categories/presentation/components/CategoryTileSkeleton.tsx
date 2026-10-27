import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { usePulseOpacity } from '../../../../core/ui/usePulseOpacity';

/** Loading placeholder shaped like a `CategoriesScreen` grid tile, with a gentle pulse. */
export function CategoryTileSkeleton() {
  const opacity = usePulseOpacity();

  return (
    <Animated.View style={[styles.tile, { opacity }]}>
      <Animated.View style={styles.iconCircle} />
      <Animated.View style={styles.labelBar} />
    </Animated.View>
  );
}

const PLACEHOLDER_COLOR = '#e5e7eb';

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  labelBar: {
    width: '55%',
    height: 15,
    borderRadius: 6,
    backgroundColor: PLACEHOLDER_COLOR,
  },
});
