import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { usePulseOpacity } from '../../../../core/ui/usePulseOpacity';

/** Loading placeholder shaped like `ProductCard`, with a gentle pulse while data is in flight. */
export function ProductCardSkeleton() {
  const opacity = usePulseOpacity();

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={styles.priceRow}>
          <View style={styles.priceBar} />
          <View style={styles.favoriteCircle} />
        </View>
        <View style={styles.titleBar} />
        <View style={styles.categoryBar} />
        <View style={styles.descriptionBlock}>
          <View style={styles.descriptionBar} />
          <View style={[styles.descriptionBar, styles.descriptionBarShort]} />
        </View>
      </View>
    </Animated.View>
  );
}

const PLACEHOLDER_COLOR = '#e5e7eb';

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  body: {
    padding: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBar: {
    width: 90,
    height: 21,
    borderRadius: 6,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  favoriteCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  titleBar: {
    marginTop: 12,
    width: '70%',
    height: 17,
    borderRadius: 6,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  categoryBar: {
    marginTop: 8,
    width: '40%',
    height: 14,
    borderRadius: 6,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  descriptionBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  descriptionBar: {
    width: '100%',
    height: 13,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: PLACEHOLDER_COLOR,
  },
  descriptionBarShort: {
    width: '60%',
    marginBottom: 0,
  },
});
