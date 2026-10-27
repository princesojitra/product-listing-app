import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DEFAULT_PRODUCT_FILTERS,
  ProductFilters,
  ProductSortOption,
} from '../../domain/models/ProductFilters';
import { GlassButton } from '../../../../core/ui/GlassButton';

interface ProductFiltersScreenProps {
  filters: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  onCancel: () => void;
}

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'ratingDesc', label: 'Rating: High to Low' },
];

const MIN_RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Any rating' },
  { value: 3, label: '3 stars & up' },
  { value: 4, label: '4 stars & up' },
];

export function ProductFiltersScreen({ filters, onApply, onCancel }: ProductFiltersScreenProps) {
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [minRating, setMinRating] = useState(filters.minRating);

  function reset() {
    setSortBy(DEFAULT_PRODUCT_FILTERS.sortBy);
    setMinRating(DEFAULT_PRODUCT_FILTERS.minRating);
  }

  // Android's formSheet dialog already sits clear of the status bar, so an
  // extra top safe-area inset here would just double up as a large gap.
  const topEdges = Platform.OS === 'ios' ? (['top'] as const) : [];

  return (
    <SafeAreaView style={styles.container} edges={topEdges}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable onPress={onCancel} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close filters">
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Sort by</Text>
        {SORT_OPTIONS.map(option => (
          <Pressable
            key={option.value}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="radio"
            accessibilityState={{ checked: sortBy === option.value }}
            accessibilityLabel={option.label}
            onPress={() => setSortBy(option.value)}>
            <Text style={styles.rowText}>{option.label}</Text>
            {sortBy === option.value && <Text style={styles.check}>✓</Text>}
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Minimum rating</Text>
        {MIN_RATING_OPTIONS.map(option => (
          <Pressable
            key={option.value}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="radio"
            accessibilityState={{ checked: minRating === option.value }}
            accessibilityLabel={option.label}
            onPress={() => setMinRating(option.value)}>
            <Text style={styles.rowText}>{option.label}</Text>
            {minRating === option.value && <Text style={styles.check}>✓</Text>}
          </Pressable>
        ))}

        <GlassButton
          label="Apply Filters"
          accessibilityLabel="Apply filters"
          onPress={() => onApply({ sortBy, minRating })}
          style={styles.applyButton}
        />
        <Pressable onPress={reset} accessibilityRole="button" accessibilityLabel="Reset filters">
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeText: {
    fontSize: 18,
    color: '#6b7280',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowText: {
    fontSize: 16,
    color: '#111827',
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  applyButton: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
  resetText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
});
