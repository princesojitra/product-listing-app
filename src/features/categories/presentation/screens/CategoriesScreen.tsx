import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../../../../app/navigation/types';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
import { Category } from '../../domain/models/Category';
import { GetCategories } from '../../domain/usecases/GetCategories';
import { useCategories } from '../hooks/useCategories';
import { GlassButton } from '../../../../core/ui/GlassButton';

function keyExtractor(item: Category): string {
  return item.slug;
}

/** Pastel accent palette, picked deterministically per category so each one keeps its own color. */
const ACCENTS = [
  { bg: '#eef2ff', fg: '#4338ca' },
  { bg: '#ecfdf5', fg: '#047857' },
  { bg: '#fff7ed', fg: '#c2410c' },
  { bg: '#fdf2f8', fg: '#be185d' },
  { bg: '#eff6ff', fg: '#1d4ed8' },
  { bg: '#fefce8', fg: '#a16207' },
];

function accentFor(slug: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % ACCENTS.length;
  }
  return ACCENTS[hash];
}

type CategoriesNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'CategoriesList'
>;

interface CategoriesScreenProps {
  getCategories: GetCategories;
}

export function CategoriesScreen({ getCategories }: CategoriesScreenProps) {
  const { state, retry } = useCategories(getCategories);
  const navigation = useNavigation<CategoriesNavigationProp>();
  const { topInset, scrollInsetProps } = useGlassScrollInsets();

  const renderItem = useCallback(
    ({ item }: { item: Category }) => {
      const accent = accentFor(item.slug);
      return (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          onPress={() =>
            navigation.navigate('CategoryProducts', {
              categorySlug: item.slug,
              categoryName: item.name,
            })
          }>
          <View style={[styles.icon, { backgroundColor: accent.bg }]}>
            <Text style={[styles.iconText, { color: accent.fg }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.rowText}>{item.name}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      );
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      {state.status === 'loading' && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Loading categories"
          />
          <Text style={styles.centeredText}>Loading categories…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <GlassButton
            label="Retry"
            onPress={retry}
            accessibilityLabel="Retry loading categories"
            style={styles.retryButton}
          />
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>
            No categories found right now. Check back soon.
          </Text>
        </View>
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <FlatList
          data={state.data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          {...scrollInsetProps}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centeredText: {
    marginTop: 12,
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowPressed: {
    opacity: 0.7,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d1d5db',
    marginLeft: 8,
  },
});
